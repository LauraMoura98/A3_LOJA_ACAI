from rest_framework import serializers
from .models.produto import Produto
from .models.categoria import Categoria
from .models.acrescimos import Acrescimos
from .models.tamanho import Tamanho
from .models.pedido import Pedido
from .models.tamanho_produto import TamanhoProduto


class ProdutoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Categoria.objects.all()
    )
    acrescimos = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Acrescimos.objects.filter(disponivel=True),
        many=True
    )

    class Meta:
        model = Produto
        fields = [
            'id',
            'nome',
            'descricao',
            'disponibilidade',
            'imagem_url',
            'categoria',
            'acrescimos',
        ]


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class AcrescimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acrescimos
        fields = '__all__'


class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class TamanhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tamanho
        fields = '__all__'


class TamanhoProdutoSerializer(serializers.ModelSerializer):
    tamanho = TamanhoSerializer()

    class Meta:
        model = TamanhoProduto
        fields = '__all__'
