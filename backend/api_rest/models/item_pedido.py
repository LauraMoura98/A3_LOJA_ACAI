from django.db import models

from .pedido import Pedido


class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE)
    tamanho = models.ForeignKey('TamanhoProduto', on_delete=models.SET_NULL, null=True, blank=True)
    acrescimos = models.ManyToManyField('Acrescimos', blank=True)
