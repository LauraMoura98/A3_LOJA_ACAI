from django.db import models


class Acrescimos(models.Model):
    nome = models.CharField(max_length=50)
    preco_adicional = models.DecimalField(
            max_digits=5,
            decimal_places=2,
            default=0.00
        )
