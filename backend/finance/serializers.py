from rest_framework import serializers
from .models import Account, Category, Transaction, Budget, RecurringTransaction


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            "id",
            "name",
            "account_type",
            "currency",
            "balance",
            "created_at",
            "updated_at",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type", "color"]


class TransactionSerializer(serializers.ModelSerializer):
    account_details = AccountSerializer(source="account", read_only=True)
    category_name = serializers.SerializerMethodField()
    category_type = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "amount",
            "date",
            "account",
            "category",
            "notes",
            "created_at",
            "account_details",
            "category_name",
            "category_type",
        ]

    def get_category_name(self, obj):
        """Returns the category's name, or 'Uncategorized' if none."""
        if obj.category:
            return obj.category.name
        return "Uncategorized"

    def get_category_type(self, obj):
        """Returns the category's type (income/expense), or 'expense' as a default."""
        if obj.category:
            return obj.category.type
        return "expense"  # Default to expense if no category is set


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    category_details = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = Budget
        fields = [
            "id",
            "category",
            "category_details",
            "amount",
            "start_date",
            "end_date",
            "created_at",
            "spent",
        ]


class RecurringTransactionSerializer(serializers.ModelSerializer):
    account_details = AccountSerializer(source="account", read_only=True)
    category_details = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = RecurringTransaction
        fields = [
            "id",
            "account",
            "category",
            "amount",
            "notes",
            "start_date",
            "next_date",
            "frequency",
            "created_at",
            "account_details",
            "category_details",
        ]

        read_only_fields = ["next_date", "account_details", "category_details"]

    def create(self, validated_data):
        """
        When creating a new recurring transaction, set its first
        'next_date' to be the same as its 'start_date'.
        """

        validated_data["next_date"] = validated_data["start_date"]
        return super().create(validated_data)
