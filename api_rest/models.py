from django.db import models


class Acrescimo(models.Model):
    nome_acrescimo = models.CharField(max_length=100, unique=True, verbose_name='Nome do Acrescimo')
    disponivel = models.BooleanField(default=True, verbose_name='Disponível')

    def __str__(self):
        return self.nome_acrescimo


class Produto(models.Model):
    nome_produto = models.CharField(max_length=255, unique=True, verbose_name='Nome do Produto', default="")
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    preco = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Preço')
    tamanho = models.CharField(max_length=50, blank=True, null=True, verbose_name='Tamanho', default="")
    acrescimos = models.ManyToManyField(Acrescimo, blank=True, verbose_name='Acrescimos')
    categoria = models.CharField(max_length=100, blank=True, null=True, verbose_name='Categoria', default="")
    disponivel = models.BooleanField(default=True, verbose_name='Disponível')
    imagem_url = models.CharField(max_length=255, blank=True, null=True, verbose_name='Imagem URL', default="")

    def __str__(self):
        return self.nome_produto
