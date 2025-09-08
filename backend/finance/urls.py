from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AccountViewSet, CategoryViewSet, TransactionViewSet, BudgetViewSet, TransactionImportView
# Import the new analytics views
from .analytics_views import SummaryAnalyticsView, SpendingByCategoryAnalyticsView

router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"budgets", BudgetViewSet, basename="budget")

urlpatterns = [
    path("", include(router.urls)),
    path("transactions/import/", TransactionImportView.as_view(), name="transactions-import"),
    # Add the new analytics URLs
    path("analytics/summary/", SummaryAnalyticsView.as_view(), name="analytics-summary"),
    path("analytics/spending-by-category/", SpendingByCategoryAnalyticsView.as_view(), name="analytics-spending"),
]