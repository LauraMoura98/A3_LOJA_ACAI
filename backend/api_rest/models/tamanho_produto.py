from django.db import models


class TamanhoProduto(models.Model):
    produto = models.ForeignKey("api_rest.Produto", on_delete=models.CASCADE, related_name='tamanhos')
    tamanho = models.ForeignKey("api_rest.Tamanho", on_delete=models.CASCADE)
    preco = models.DecimalField(max_digits=6, decimal_places=2)
