from django.db import models


class ItemPedido(models.Model):
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE)
    tamanho = models.ForeignKey('Tamanho', on_delete=models.SET_NULL, null=True, blank=True)
    acrescimos = models.ManyToManyField('Acrescimos', blank=True)
