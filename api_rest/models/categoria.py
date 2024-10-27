from django.db import models


class Categoria(models.Model):
    nome = models.CharField(max_length=50,  unique=True)
    descricao = models.TextField(blank=True)
