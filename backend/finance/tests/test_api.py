# backend/finance/tests/test_api.py
from rest_framework.test import APIClient
import pytest


@pytest.mark.django_db
def test_register_and_crud_account():
    client = APIClient()

    # register
    resp = client.post(
        "/api/auth/register/",
        {"username": "testu", "email": "t@t.com", "password": "pass1234"},
        format="json",
    )
    assert resp.status_code == 201

    # get token
    resp = client.post(
        "/api/auth/token/", {"username": "testu", "password": "pass1234"}, format="json"
    )
    assert resp.status_code == 200
    access = resp.json()["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    # create account
    resp = client.post(
        "/api/accounts/",
        {
            "name": "Wallet",
            "account_type": "cash",
            "currency": "USD",
            "balance": "50.00",
        },
        format="json",
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Wallet"

    # get accounts list
    resp = client.get("/api/accounts/")
    assert resp.status_code == 200
    accounts = resp.json()
    assert isinstance(accounts, list)
    assert any(acc["name"] == "Wallet" for acc in accounts)
