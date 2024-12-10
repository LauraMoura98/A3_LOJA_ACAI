from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group

from .models.produto import Produto
from .models.categoria import Categoria
from .models.acrescimos import Acrescimos
from .models.tamanho import Tamanho
from .models.tamanho_produto import TamanhoProduto
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


User = get_user_model()


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        user_group, created = Group.objects.get_or_create(name='site_users')
        user.groups.add(user_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        return data


class ItemPedidoSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemPedido
        fields = ['produto', 'tamanho', 'acrescimos']


class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True)
    senha = serializers.CharField(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'status', 'data_criacao', 'data_atualizacao', 'senha', 'itens_pedido']
        read_only_fields = ['cliente', 'data_criacao', 'data_atualizacao', 'senha']

    def create(self, validated_data):

        itens_data = validated_data.pop('itens_pedido')
        request = self.context.get('request')

        pedido = Pedido.objects.create(cliente=request.user, **validated_data)

        for item_data in itens_data:
            acrescimos_data = item_data.pop('acrescimos', [])
            item = ItemPedido.objects.create(**item_data)
            item.acrescimos.set(acrescimos_data)
            pedido.item_pedido.add(item)

        return pedido
