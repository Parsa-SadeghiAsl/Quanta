# backend/finance/permissions.py
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Object-level permission: only owners can access.
    Assumes model instance has `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        try:
            return obj.user == request.user
        except AttributeError:
            return False
