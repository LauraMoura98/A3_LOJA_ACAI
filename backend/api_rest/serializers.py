from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models.produto import Produto
from .models.categoria import Categoria
from .models.acrescimos import Acrescimos
from .models.tamanho import Tamanho
from .models.tamanho_produto import TamanhoProduto
from .models.cliente import Cliente
from .models.pedido import Pedido
from .models.item_pedido import ItemPedido


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


class TamanhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tamanho
        fields = '__all__'


class TamanhoProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TamanhoProduto
        fields = '__all__'


Usuario = get_user_model()


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Cliente
        fields = ['id', 'username', 'password', 'email', 'telefone']

    def create(self, validated_data):
        cliente = Cliente.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            telefone=validated_data.get('telefone', ''),
            password=validated_data['password']
        )
        return cliente


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        return data


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto = serializers.CharField(source='produto.nome')
    tamanho = serializers.CharField(source='tamanho.nome', allow_null=True)
    acrescimos = AcrescimoSerializer(many=True)

    class Meta:
        model = ItemPedido
        fields = ['produto', 'tamanho', 'acrescimos']


class PedidoSerializer(serializers.ModelSerializer):
    cliente = serializers.CharField(source='cliente.id')
    itens = ItemPedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = [
            'id',
            'status',
            'data_criacao',
            'cliente',
            'itens',
            'senha'
        ]
