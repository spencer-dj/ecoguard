from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Note, Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        # Create Profile automatically with default role
        Profile.objects.create(user=user, role="User")
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'description']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role")  # flatten role

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    def update(self, instance, validated_data):
        # Extract role if provided
        role = validated_data.pop("profile", {}).get("role", None) \
            if "profile" in validated_data else validated_data.pop("role", None)

        # Update User fields
        instance = super().update(instance, validated_data)

        # Update Profile role
        if role:
            instance.profile.role = role
            instance.profile.save()

        return instance

    def create(self, validated_data):
        role = validated_data.pop("profile", {}).get("role", None) \
            if "profile" in validated_data else validated_data.pop("role", None)

        user = User.objects.create(**validated_data)

        if role:
            Profile.objects.create(user=user, role=role)
        else:
            Profile.objects.create(user=user, role="User")

        return user
