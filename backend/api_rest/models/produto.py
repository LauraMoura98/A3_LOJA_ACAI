from django.db import models
from .categoria import Categoria
from .acrescimos import Acrescimos


class Produto(models.Model):

    nome = models.CharField(max_length=255, default="")
    descricao = models.TextField(blank=True, null=True)
    disponibilidade = models.BooleanField(default=True)
    imagem_url = models.CharField(max_length=255, blank=True, null=True, default="")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    acrescimos = models.ManyToManyField(Acrescimos, blank=True, related_name="produtos")

    def __str__(self):
        return self.nome
