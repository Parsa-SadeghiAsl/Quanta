import csv
import io
from decimal import Decimal
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.generics import GenericAPIView
from .models import Account, Category, Transaction, Budget
from .serializers import AccountSerializer, CategorySerializer, TransactionSerializer, BudgetSerializer
from .permissions import IsOwner


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


class CategoryViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Category.objects.all()


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
