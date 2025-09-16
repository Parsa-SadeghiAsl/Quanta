import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from finance.models import Account, Category, Transaction
from decimal import Decimal

User = get_user_model()


@pytest.mark.django_db
def test_balance_update_on_create_update_delete():
    u = User.objects.create_user("u1", password="pass1234")
    acc = Account.objects.create(
        user=u, name="A1", account_type="bank", balance=Decimal("100.00")
    )
    cat_exp = Category.objects.create(user=u, name="Food", type="expense")
    # create expense transaction
    tx = Transaction.objects.create(
        user=u, account=acc, category=cat_exp, amount=Decimal("25.00")
    )
    acc.refresh_from_db()
    assert acc.balance == Decimal("75.00")
    # update amount
    tx.amount = Decimal("10.00")
    tx.save()
    acc.refresh_from_db()
    assert acc.balance == Decimal("90.00")
    # delete tx
    tx.delete()
    acc.refresh_from_db()
    assert acc.balance == Decimal("100.00")


@pytest.mark.django_db
def test_csv_import_endpoint(tmp_path):
    u = User.objects.create_user("u2", password="pass1234")
    client = APIClient()
    client.force_authenticate(user=u)

    # create CSV
    csv_content = (
        "date,amount,account,category,notes\n2025-09-01,50.00,Wallet,Groceries,weekly\n"
    )
    f = tmp_path / "t.csv"
    f.write_text(csv_content)

    # NOTE: full path including /api/
    url = "/api/transactions/import/"

    with open(f, "rb") as fh:
        resp = client.post(url, {"file": fh}, format="multipart")

    assert resp.status_code == 200
    data = resp.json()
    assert data["created"] == 1
