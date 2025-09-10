from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ('username', 'email', 'avatar')

    def update(self, instance, validated_data):
        # This custom update method handles the nested user data.
        # 'instance' here is the Profile instance.

        # Pop the nested 'user' data if it exists.
        user_data = validated_data.pop('user', {})
        username = user_data.get('username')

        # Update the User instance's username if it was provided in the request
        if username:
            instance.user.username = username
            instance.user.save()

        # Update the Profile instance's fields (e.g., the avatar)
        # This uses the default ModelSerializer update logic for the remaining fields.
        super().update(instance, validated_data)

        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, data):
        """
        Check that the two new password entries match.
        """
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return data