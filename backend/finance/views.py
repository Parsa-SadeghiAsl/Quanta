import csv
import io
from decimal import Decimal
from django.utils import timezone
from datetime import datetime
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.generics import GenericAPIView
from django.db.models import Sum, Q
from .models import Account, Category, Transaction, Budget, RecurringTransaction
from .serializers import AccountSerializer, CategorySerializer, TransactionSerializer, BudgetSerializer, RecurringTransactionSerializer
from .permissions import IsOwner
from rest_framework.permissions import IsAuthenticated


DATE_FORMATS = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y")

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
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        )

    @action(detail=False, methods=['get'])
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


class BudgetViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Budget.objects.all()


class TransactionImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        """
        Accepts a CSV file (multipart/form-data) as `file`.
        Expected headers (case-insensitive): date, amount, account, category, notes
        Params:
          - on_duplicate: "skip" (default) or "overwrite"
        """
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

        on_duplicate = request.data.get("on_duplicate", "skip")
        text = uploaded.read().decode(errors="replace")
        f = io.StringIO(text)
        reader = csv.DictReader(f)
        created = 0
        skipped = 0
        errors = []

        for idx, row in enumerate(reader, start=1):
            try:
                # normalize keys
                row_l = {k.strip().lower(): (v or "").strip() for k, v in row.items()}

                raw_amount = row_l.get("amount") or row_l.get("value") or ""
                if raw_amount == "":
                    raise ValueError("missing amount")
                amt = Decimal(raw_amount.replace(",", "").replace("$", ""))

                date_val = parse_date(row_l.get("date", "")) or row_l.get("date") or None

                account_name = row_l.get("account") or "Imported"
                account_obj, _ = Account.objects.get_or_create(user=request.user, name=account_name)

                category_name = row_l.get("category") or None
                category_obj = None
                if category_name:
                    # default to expense for unknown category name if amount negative else income
                    cat_type = "expense" if amt < 0 else "income"
                    category_obj, _ = Category.objects.get_or_create(user=request.user, name=category_name, defaults={"type": cat_type})

                # Duplicate detection: same account + amount + date
                dup_q = Transaction.objects.filter(user=request.user, account=account_obj, amount=amt)
                if date_val:
                    dup_q = dup_q.filter(date=date_val)
                if dup_q.exists():
                    if on_duplicate == "skip":
                        skipped += 1
                        continue
                    elif on_duplicate == "overwrite":
                        dup_q.delete()

                tx = Transaction(
                    user=request.user,
                    account=account_obj,
                    category=category_obj,
                    amount=amt,
                    date=date_val if isinstance(date_val, (str, type(None))) else date_val,
                    notes=row_l.get("notes") or row_l.get("description") or "",
                )
                # use serializer to validate
                ser = TransactionSerializer(data={
                    "account": account_obj.pk,
                    "category": category_obj.pk if category_obj else None,
                    "amount": str(amt),
                    "date": tx.date if tx.date else None,
                    "notes": tx.notes
                })
                ser.is_valid(raise_exception=True)
                ser.save(user=request.user)
                created += 1
            except Exception as e:
                errors.append({"row": idx, "error": str(e)})
                continue

        return Response({"created": created, "skipped": skipped, "errors": errors})
    
    

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
