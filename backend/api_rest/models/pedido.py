from django.db import models

class Pedido(models.Model):
    STATUS_PEDIDO = [
        ('PENDENTE', 'Pendente'),
        ('EM_PREPARO', 'Em preparo'),
        ('PRONTO', 'Pronto para retirada'),
        ('ENTREGUE', 'Entregue'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_PEDIDO, default='PENDENTE')
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
