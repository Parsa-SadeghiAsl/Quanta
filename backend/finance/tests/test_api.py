# backend/finance/tests/test_api.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, RequestsClient
from decimal import Decimal

User = get_user_model()

@pytest.mark.django_db
def test_register_and_crud_account():
    client = RequestsClient()
    # register
    resp = client.post("/api/auth/register/", {"username": "testu", "email": "t@t.com", "password": "pass1234"})
    assert resp.status_code == 201

    # get token
    resp = client.post("/api/auth/token/", {"username": "testu", "password": "pass1234"})
    assert resp.status_code == 200
    access = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    # create account
    resp = client.post("/api/accounts/", {"name": "Wallet", "account_type": "cash", "currency": "USD", "balance": "50.00"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Wallet"

    # get accounts list
    resp = client.get("/api/accounts/")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1