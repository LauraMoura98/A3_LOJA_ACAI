from django.contrib.auth.models import AbstractUser
from django.db import models


class Cliente(AbstractUser):
    telefone = models.CharField(max_length=15, blank=True, null=True)
