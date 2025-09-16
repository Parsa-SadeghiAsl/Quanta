from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    # 'source' maps this serializer field to the related user model's field.
    username = serializers.CharField(source="user.username")
    # email is read-only, it won't be expected in PATCH/POST data.
    email = serializers.EmailField(source="user.email", read_only=True)
    # Use 'allow_empty_file=True' if you want to allow clearing the avatar.
    # 'required=False' and 'allow_null=True' are essential for PATCH requests.
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ("username", "email", "avatar")

    def update(self, instance, validated_data):
        # This custom update method now correctly handles the nested user data
        # and lets the parent class handle the rest.
        # 'instance' here is the Profile instance.

        # 1. Pop the nested user data from validated_data.
        #    The key is 'user' because of the 'source' argument on the fields above.
        user_data = validated_data.pop("user", {})

        # 2. If a new username was provided in user_data, update the related user object.
        if user_data.get("username"):
            instance.user.username = user_data.get("username")
            instance.user.save()

        # 3. Let the default ModelSerializer.update() handle the remaining fields.
        #    This is the key change. The default implementation will correctly
        #    process the 'avatar' field and any other Profile fields you might add.
        #    There is no need to manually handle 'instance.avatar = avatar'.
        return super().update(instance, validated_data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}

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
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return data
