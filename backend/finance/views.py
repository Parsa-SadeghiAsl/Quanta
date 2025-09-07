# backend/finance/views.py
from rest_framework import viewsets, permissions
from rest_framework.generics import GenericAPIView
from .models import Account, Category, Transaction, Budget
from .serializers import AccountSerializer, CategorySerializer, TransactionSerializer, BudgetSerializer
from .permissions import IsOwner

class OwnerMixin(GenericAPIView):
    """
    mixin to filter by request.user and set owner on create
    """
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AccountViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Account.objects.all()


class CategoryViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Category.objects.all()


class TransactionViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Transaction.objects.select_related("account", "category").all()


class BudgetViewSet(OwnerMixin, viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Budget.objects.all()
