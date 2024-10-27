from django.db import models


class ItemPedido(models.Model):
    pedido = models.ForeignKey("api_rest.Pedido", on_delete=models.CASCADE, related_name="itens")
    produto = models.ForeignKey("api_rest.Produto", on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    ingredientes_extras = models.ManyToManyField("api_rest.Acrescimos", blank=True)
