from rest_framework import serializers
from django.db.models import Sum
from .models import Account, Category, Transaction, Budget
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
    # These read-only fields will include the names in the API response
    account_name = serializers.CharField(source='account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "amount", "date", "notes", "created_at",
            "account", # For writing (sending an ID to the API)
            "category", # For writing
            "account_name", # For reading
            "category_name", # For reading
            "category_type" # For reading
        ]

class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "category", "category_name", "amount", "start_date", "end_date", "created_at", "spent"]

    def get_spent(self, obj):
        spent_sum = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            date__range=[obj.start_date, obj.end_date]
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return spent_sum

