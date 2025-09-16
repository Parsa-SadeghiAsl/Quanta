import os
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    UserRegistrationSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(APIView):
    # Add parsers to handle multipart form data, which is how files are sent.
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # No changes needed for the GET method.
        serializer = ProfileSerializer(request.user.profile)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        # --- START DEBUGGING ---
        print("--- New PATCH Request ---")
        # 1. Print the incoming data from the request
        print(f"Request Data: {request.data}")
        # 2. Print the parsed files that DRF has recognized
        print(f"Request Files: {request.FILES}")
        # 3. Print the MEDIA_ROOT path Django is trying to use
        print(f"MEDIA_ROOT from settings: {settings.MEDIA_ROOT}")
        # 4. Check if that path actually exists on your computer
        print(f"Does MEDIA_ROOT exist? {os.path.exists(settings.MEDIA_ROOT)}")
        print("------------------------")
        # --- END DEBUGGING ---

        serializer = ProfileSerializer(
            request.user.profile, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    An endpoint for changing password.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.data.get("old_password")):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # set_password hashes the password
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"status": "password set"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
