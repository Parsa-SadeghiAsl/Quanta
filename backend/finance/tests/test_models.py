import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from finance.models import Account, Category, Transaction, Budget
from decimal import Decimal

User = get_user_model()

@pytest.mark.django_db
def test_account_category_transaction_models():
    user = User.objects.create_user(username="u1", password="pass1234")
    acc = Account.objects.create(user=user, name="Acc1", account_type="bank", currency="USD", balance=Decimal("100.00"))
    cat = Category.objects.create(user=user, name="Food", type="expense")
    tx = Transaction.objects.create(user=user, account=acc, category=cat, amount=Decimal("10.00"))
    b = Budget.objects.create(user=user, category=cat, amount=Decimal("200.00"), start_date=timezone.now().date(), end_date=timezone.now().date())

    assert str(acc)
    assert str(cat)
    assert str(tx)
    assert str(b)