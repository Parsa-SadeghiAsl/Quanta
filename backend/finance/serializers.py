from rest_framework import serializers
from django.db.models import Sum
from .models import Account, Category, Transaction, Budget, RecurringTransaction
from decimal import Decimal

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["id", "name", "account_type", "currency", "balance", "created_at", "updated_at"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type", "color"]


class TransactionSerializer(serializers.ModelSerializer):
    # Keep the nested account details
    account_details = AccountSerializer(source='account', read_only=True)
    # Define new, flat fields for the category info
    category_name = serializers.SerializerMethodField()
    category_type = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id", "amount", "date", "account", "category", "notes", "created_at",
            "account_details",
            # Add the new flat fields to the output
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
        return 'expense' # Default to expense if no category is set

class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "category", "category_details", "amount", "start_date", "end_date", "created_at", "spent"]

    def get_spent(self, obj):
        total_spent = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            date__range=[obj.start_date, obj.end_date]
        ).aggregate(total=Sum('amount'))['total'] or 0
        return total_spent



class RecurringTransactionSerializer(serializers.ModelSerializer):
    account_details = AccountSerializer(source='account', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'account', 'category', 'amount', 'notes', 'start_date', 'next_date',
            'frequency', 'created_at', 'account_details', 'category_details'
        ]
        # --- CHANGE 1: Make next_date read-only ---
        # The client doesn't need to send this; we will set it automatically.
        read_only_fields = ['next_date', 'account_details', 'category_details']

    # --- CHANGE 2: Override the create method ---
    def create(self, validated_data):
        """
        When creating a new recurring transaction, set its first
        'next_date' to be the same as its 'start_date'.
        """
        # Set the next_date automatically
        validated_data['next_date'] = validated_data['start_date']
        return super().create(validated_data)

