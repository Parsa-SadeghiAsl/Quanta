from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Q, F
from django.db.models.functions import Coalesce
from decimal import Decimal
from django.utils import timezone # <-- Use Django's timezone utility

from .models import Account, Transaction, Category

class SummaryAnalyticsView(APIView):
    """
    Provides summary analytics for the dashboard.
    - Total balance across all accounts.
    - Total income for the current month.
    - Total expenses for the current month.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # --- FIX: Use timezone.localdate() instead of datetime.date.today() ---
        today = timezone.localdate()
        start_of_month = today.replace(day=1)

        # 1. Total Balance
        total_balance = Account.objects.filter(user=user).aggregate(
            total=Coalesce(Sum('balance'), Decimal('0.00'))
        )['total']

        # 2. Monthly Income
        monthly_income = Transaction.objects.filter(
            user=user,
            date__gte=start_of_month,
            category__type='income'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'))
        )['total']

        # 3. Monthly Expenses
        monthly_expenses = Transaction.objects.filter(
            user=user,
            date__gte=start_of_month,
            category__type='expense'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'))
        )['total']

        return Response({
            'total_balance': total_balance,
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
        })


class SpendingByCategoryAnalyticsView(APIView):
    """
    Provides spending breakdown by category for the current month.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # --- FIX: Use timezone.localdate() instead of datetime.date.today() ---
        today = timezone.localdate()
        start_of_month = today.replace(day=1)

        spending_data = Transaction.objects.filter(
            user=user,
            date__gte=start_of_month,
            category__type='expense'
        ).values(
            'category__name', 'category__color'
        ).annotate(
            amount=Sum('amount')
        ).order_by('-amount')

        # Format for react-native-chart-kit pie chart
        formatted_data = [
            {
                'name': item['category__name'] or 'Uncategorized',
                'amount': item['amount'],
                'color': item['category__color'] or '#cccccc',
                'legendFontColor': '#7F7F7F',
                'legendFontSize': 15,
            }
            for item in spending_data
        ]

        return Response(formatted_data)

