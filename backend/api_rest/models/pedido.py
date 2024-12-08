from django.db import models
import random, string

from .cliente import Cliente


class Pedido(models.Model):
    STATUS_PEDIDO = [
        ('PENDENTE', 'Pendente'),
        ('EM_PREPARO', 'Em preparo'),
        ('PRONTO', 'Pronto para retirada'),
        ('ENTREGUE', 'Entregue'),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='pedidos')
    status = models.CharField(max_length=15, choices=STATUS_PEDIDO, default='PENDENTE')
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    senha = models.CharField(max_length=10, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.senha:
            self.senha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super().save(*args, **kwargs)
