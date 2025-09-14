import datetime
import calendar
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Q
from django.db.models.functions import Coalesce
from decimal import Decimal
from .serializers import BudgetSerializer, TransactionSerializer
from .models import Account, Transaction, Budget

class SummaryAnalyticsView(APIView):
    """
    Provides summary analytics for the dashboard for a given month.
    - Total balance (independent of month).
    - Total income for the specified month.
    - Total expenses for the specified month.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            year = int(request.query_params.get('year', timezone.now().year))
            month = int(request.query_params.get('month', timezone.now().month))
        except (ValueError, TypeError):
            return Response({"error": "Invalid year or month format."}, status=400)

        # Date range for the selected month
        start_of_month = datetime.date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        end_of_month = datetime.date(year, month, last_day)

        # Total balance is always the current total across all accounts
        total_balance = Account.objects.filter(user=user).aggregate(
            total=Coalesce(Sum('balance'), Decimal('0.00'))
        )['total']

        # Monthly income for the selected period
        monthly_income = Transaction.objects.filter(
            user=user,
            date__range=[start_of_month, end_of_month],
            category__type='income'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'))
        )['total']

        # Monthly expenses for the selected period
        monthly_expenses = Transaction.objects.filter(
            user=user,
            date__range=[start_of_month, end_of_month],
            category__type='expense'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'))
        )['total']

        return Response({
            'total_balance': total_balance,
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
        })


class BudgetProgressView(APIView):
    """
    Provides budget progress for the specified month.
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            year = int(request.query_params.get('year', timezone.localdate().year))
            month = int(request.query_params.get('month', timezone.localdate().month))
        except (ValueError, TypeError):
            year, month = timezone.localdate().year, timezone.localdate().month
        
        # Find budgets that overlap with the selected month
        budgets = Budget.objects.filter(
            user=user,
            start_date__year__lte=year, end_date__year__gte=year,
            start_date__month__lte=month, end_date__month__gte=month
        )
        
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)


class SpendingByCategoryAnalyticsView(APIView):
    """
    Provides spending breakdown by category for the specified month.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            year = int(request.query_params.get('year', timezone.now().year))
            month = int(request.query_params.get('month', timezone.now().month))
        except (ValueError, TypeError):
            return Response({"error": "Invalid year or month format."}, status=400)

        start_of_month = datetime.date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        end_of_month = datetime.date(year, month, last_day)

        spending_data = Transaction.objects.filter(
            user=user,
            date__range=[start_of_month, end_of_month],
            category__type='expense'
        ).values(
            'category__name', 'category__color', 'date'
        ).annotate(
            amount=Sum('amount')
        ).order_by('-amount')

        # Format for react-native-chart-kit pie chart
        formatted_data = [
            {
                'fullName': item["category__name"] or 'Uncategorized',
                'name': item["category__name"] if len(item["category__name"])< 10 else f'{item["category__name"][:10]}...',
                'amount': item['amount'],
                'color': item['category__color'] or '#cccccc',
                'legendFontColor': '#7F7F7F',
                'legendFontSize': 12,
                'date': item['date'],
            }
            for item in spending_data
        ]

        return Response(formatted_data)

class RecentTransactionsView(APIView):
    """
    Returns the 5 most recent transactions for the dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        transactions = Transaction.objects.filter(user=user).order_by('-date', '-created_at')[:5]
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
