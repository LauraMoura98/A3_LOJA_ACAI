from django.db import models


class TamanhoProduto(models.Model):
    produto = models.ForeignKey("api_rest.Produto", on_delete=models.CASCADE)
    tamanho = models.ForeignKey("api_rest.Tamanho", on_delete=models.CASCADE, related_name='tamanhos')
    preco = models.DecimalField(max_digits=6, decimal_places=2)


class Meta:
    unique_together = ('produto', 'tamanho')

    def __str__(self):
        return f"{self.produto.nome} - {self.tamanho.nome} - {self.preco}"
