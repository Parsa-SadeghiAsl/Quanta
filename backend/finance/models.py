from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone
import calendar
from datetime import timedelta

# --- Core Models ---

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

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
        null=True,
        blank=True
    )
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

# --- Recurring Transaction Model ---

class RecurringTransaction(models.Model):
    FREQ_DAILY = "daily"
    FREQ_WEEKLY = "weekly"
    FREQ_MONTHLY = "monthly"
    FREQ_CHOICES = (
        (FREQ_DAILY, "Daily"),
        (FREQ_WEEKLY, "Weekly"),
        (FREQ_MONTHLY, "Monthly")
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recurring_transactions")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="recurring_transactions")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    start_date = models.DateField()
    next_date = models.DateField()
    frequency = models.CharField(max_length=10, choices=FREQ_CHOICES, default=FREQ_MONTHLY)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recurring {self.amount} {self.frequency} for {self.user}"

    def advance_next_date(self):
        from datetime import timedelta
        if self.frequency == self.FREQ_DAILY:
            self.next_date += timedelta(days=1)
        elif self.frequency == self.FREQ_WEEKLY:
            self.next_date += timedelta(weeks=1)
        elif self.frequency == self.FREQ_MONTHLY:
            # Advance by one month, handling month ends correctly
            year, month = divmod(self.next_date.month, 12)
            new_month = month + 1
            new_year = self.next_date.year + year
            day = min(self.next_date.day, calendar.monthrange(new_year, new_month)[1])
            self.next_date = self.next_date.replace(year=new_year, month=new_month, day=day)
        self.save(update_fields=["next_date"])
        return self.next_date
