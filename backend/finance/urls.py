from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    AccountViewSet,
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    RecurringTransactionViewSet,
)

# Import the new analytics views
from .analytics_views import (
    SummaryAnalyticsView,
    SpendingByCategoryAnalyticsView,
    BudgetProgressView,
    RecentTransactionsView,
)

router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"budgets", BudgetViewSet, basename="budget")
router.register(
    r"recurring-transactions",
    RecurringTransactionViewSet,
    basename="recurring-transaction",
)


urlpatterns = [
    path("", include(router.urls)),
    path(
        "categories/mine/",
        CategoryViewSet.as_view({"get": "mine"}),
        name="category-mine",
    ),
    path(
        "categories/",
        CategoryViewSet.as_view({"get": "list", "post": "create"}),
        name="category-list",
    ),
    path(
        "categories/<int:pk>/",
        CategoryViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="category-detail",
    ),
    path(
        "analytics/summary/", SummaryAnalyticsView.as_view(), name="analytics-summary"
    ),
    path(
        "analytics/spending-by-category/",
        SpendingByCategoryAnalyticsView.as_view(),
        name="analytics-spending",
    ),
    path(
        "analytics/budget-progress/",
        BudgetProgressView.as_view(),
        name="budget-progress",
    ),
    path(
        "analytics/recent-transactions/",
        RecentTransactionsView.as_view(),
        name="recent-transactions",
    ),
]
