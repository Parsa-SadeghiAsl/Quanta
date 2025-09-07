# backend/finance/models.py
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class Account(models.Model):
    TYPE_BANK = "bank"
    TYPE_CASH = "cash"
    TYPE_CREDIT = "credit"
    TYPE_CHOICES = ((TYPE_BANK, "Bank"), (TYPE_CASH, "Cash"), (TYPE_CREDIT, "Credit"))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="accounts")
    name = models.CharField(max_length=120)
    account_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    currency = models.CharField(max_length=3, default="USD")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "name")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.currency})"


class Category(models.Model):
    TYPE_EXPENSE = "expense"
    TYPE_INCOME = "income"
    TYPE_CHOICES = ((TYPE_EXPENSE, "Expense"), (TYPE_INCOME, "Income"))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    color = models.CharField(max_length=7, blank=True, default="#cccccc")

    class Meta:
        unique_together = ("user", "name")

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions")
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.amount} on {self.date} — {self.account.name}"


class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="budgets")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"Budget {self.category.name} {self.amount}"
