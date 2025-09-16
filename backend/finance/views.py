import csv
import io
import logging
import random
from decimal import Decimal
from django.utils import timezone
from datetime import datetime
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.generics import GenericAPIView
from django.db.models import Q
from .models import Account, Category, Transaction, Budget, RecurringTransaction
from .serializers import (
    AccountSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    RecurringTransactionSerializer,
)
from .permissions import IsOwner


DATE_FORMATS = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y")

logger = logging.getLogger(__name__)


def generate_random_color():
    """Generates a random, visually appealing hex color."""
    return f"#{random.randint(0, 0xFFFFFF): 06x}"


def parse_date(s):
    s = s.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt).date()
        except Exception:
            continue
    return None


class OwnerMixin(GenericAPIView):
    """
    mixin to filter by request.user and set owner on create
    """

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccountViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Account.objects.all()


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # The main queryset returns both system and user-specific categories
        return Category.objects.filter(Q(user=self.request.user) | Q(user__isnull=True))

    @action(detail=False, methods=["get"])
    def mine(self, request):
        """
        A custom endpoint to return ONLY the categories created by the
        currently authenticated user.
        """
        user_categories = Category.objects.filter(user=request.user)
        serializer = self.get_serializer(user_categories, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # When a user creates a category, it must be assigned to them
        serializer.save(user=self.request.user)


class TransactionViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Transaction.objects.select_related("account", "category").all()

    @action(
        detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser]
    )
    def import_csv(self, request, *args, **kwargs):
        # ... (logging and file handling remain the same)
        user = request.user
        created_count = 0
        skipped_count = 0
        errors = []

        try:
            decoded_file = request.FILES.get("file").read().decode("utf-8")
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            rows = list(reader)
        except Exception as e:
            return Response(
                {"detail": f"Error processing file: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for i, row in enumerate(rows, 1):
            try:
                row_cleaned = {k.lower().strip(): v for k, v in row.items()}
                account_name = row_cleaned.get("account", "Imported Account")
                category_name = row_cleaned.get("category", "Uncategorized")
                # --- THIS IS THE NEW LOGIC ---
                # 1. Look for the 'category_type' column in the CSV. Default to 'expense'.
                category_type = row_cleaned.get("category_type", "expense").lower()
                if category_type not in ["income", "expense"]:
                    category_type = "expense"  # Sanitize the input

                account, _ = Account.objects.get_or_create(
                    name=account_name, user=user, defaults={"account_type": "bank"}
                )

                category = (
                    Category.objects.filter(
                        Q(name__iexact=category_name)
                        & (Q(user=user) | Q(user__isnull=True))
                    )
                    .order_by("user_id")
                    .first()
                )

                if not category:
                    # 2. When creating a new category, use the type from the CSV.
                    category = Category.objects.create(
                        name=category_name,
                        user=user,
                        type=category_type,
                        color=generate_random_color(),
                    )

                Transaction.objects.create(
                    user=user,
                    account=account,
                    category=category,
                    amount=Decimal(
                        row_cleaned.get("amount", "0").replace("$", "").replace(",", "")
                    ),
                    date=datetime.strptime(row_cleaned.get("date"), "%Y-%m-%d").date(),
                    notes=row_cleaned.get("notes", ""),
                )
                created_count += 1
            except Exception as e:
                error_detail = (
                    f"Row {i} skipped due to a data error: {e}. Row data: {row}"
                )
                logger.warning(error_detail)
                errors.append({"row": i, "data": row, "error": str(e)})
                skipped_count += 1

        return Response(
            {"created": created_count, "skipped": skipped_count, "errors": errors},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def export_csv(self, request, *args, **kwargs):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="transactions.csv"'
        writer = csv.writer(response)

        # 3. Add the new 'category_type' column to the header.
        writer.writerow(
            ["date", "account", "category", "category_type", "amount", "notes"]
        )

        transactions = self.get_queryset().order_by("date")
        for tx in transactions:
            # 4. Add the category type to each row.
            category_name = tx.category.name if tx.category else "N/A"
            category_type = tx.category.type if tx.category else ""
            writer.writerow(
                [
                    tx.date,
                    tx.account.name,
                    category_name,
                    category_type,
                    tx.amount,
                    tx.notes,
                ]
            )

        return response


class BudgetViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Budget.objects.all()


class RecurringTransactionViewSet(OwnerMixin, viewsets.ModelViewSet):
    """
    API endpoint for recurring transactions.
    """

    serializer_class = RecurringTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = RecurringTransaction.objects.all()

    def perform_create(self, serializer):
        """
        Overrides the default create behavior. After saving a new recurring
        transaction, it immediately checks if the first transaction is due.
        """
        # First, save the new recurring transaction instance
        # The serializer's `create` method will set the initial `next_date`
        recurring_instance = serializer.save(user=self.request.user)

        # Now, check if the first transaction should be created immediately
        today = timezone.localdate()
        if recurring_instance.next_date <= today:
            while True:

                # Create the first transaction
                Transaction.objects.create(
                    user=recurring_instance.user,
                    account=recurring_instance.account,
                    category=recurring_instance.category,
                    amount=recurring_instance.amount,
                    date=recurring_instance.next_date,
                    notes=f"Recurring: {recurring_instance.notes or recurring_instance.category}",
                )
                # Advance the date for the next cycle
                recurring_instance.advance_next_date()
                if recurring_instance.next_date > today:
                    break
                else:
                    continue
