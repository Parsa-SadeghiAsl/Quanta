# backend/finance/admin.py
from django.contrib import admin
from .models import Account, Category, Transaction, Budget, RecurringTransaction


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "account_type", "balance")
    search_fields = ("name",)
    list_filter = ("account_type",)


@admin.register(RecurringTransaction)
class RecurringTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "account",
        "frequency",
        "amount",
        "start_date",
        "next_date",
    )
    search_fields = ("name",)
    list_filter = ("frequency",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "type", "color")
    search_fields = ("name",)
    list_filter = ("type",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "account", "amount", "date", "category")
    list_filter = ("date",)
    search_fields = ("notes",)


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "amount", "start_date", "end_date")
    list_filter = ("start_date",)
