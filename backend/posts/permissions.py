from rest_framework import permissions

SAFE_CREATE_METHODS = permissions.SAFE_METHODS + ('POST',)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.owner == request.user


class IsOwnerOrReadCreateOnly(permissions.BasePermission):
    """
    Permission class allowing everybody to read or create new objects,
    and nobody to modify them.

    Assuming Django uses POST only for creating new items (hopefully).
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_CREATE_METHODS:
            return True

        return obj.author == request.user