from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    description = models.CharField(max_length=300)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note')


class Profile(models.Model):
    ROLE_CHOICES = (
        ("Admin", "Admin"),
        ("Ranger", "Ranger"),
        ("Viewer", "Viewer"),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="Ranger")

    def __str__(self):
        return f"{self.user.username} ({self.role})"