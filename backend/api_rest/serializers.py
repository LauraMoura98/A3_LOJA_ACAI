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
        User.groups.add(user_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        return data


class ItemPedidoSerializer(serializers.ModelSerializer):

    produto = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all())
    tamanho = serializers.PrimaryKeyRelatedField(queryset=TamanhoProduto.objects.all(), allow_null=True)
    acrescimos = serializers.PrimaryKeyRelatedField(queryset=Acrescimos.objects.all(), many=True, allow_null=True)

    class Meta:
        model = ItemPedido
        fields = ['produto', 'tamanho', 'acrescimos']


class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True)
    senha = serializers.CharField(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'status', 'data_criacao', 'data_atualizacao', 'senha', 'itens_pedido']
        read_only_fields = ['data_criacao', 'data_atualizacao', 'senha']

    def create(self, validated_data):
        request_user = self.context['request'].user
        itens_pedido_data = validated_data.pop('itens_pedido', [])

        # Remove o cliente de validated_data, caso exista, para evitar conflito
        validated_data.pop('cliente', None)

        # Verifica se já existe um pedido pendente para o cliente autenticado
        pedido_existente = Pedido.objects.filter(cliente=request_user, status='PENDENTE').first()

        if pedido_existente:
            for item_data in itens_pedido_data:
                produto = Produto.objects.get(id=item_data['id_produto'])
                tamanho_produto_nome = item_data.get("tamanho_produto")
                tamanho_produto = TamanhoProduto.objects.filter(nome=tamanho_produto_nome).first()
                acrescimos = Acrescimos.objects.filter(nome__in=item_data['acrescimos'])

                item_pedido = ItemPedido.objects.create(
                    pedido=pedido_existente,
                    produto=produto,
                    tamanho=tamanho_produto,
                )
                item_pedido.acrescimos.set(acrescimos)
            return pedido_existente

        # Cria um novo pedido para o cliente autenticado
        pedido = Pedido.objects.create(cliente=request_user, **validated_data)

        for item_data in itens_pedido_data:
            produto = Produto.objects.get(id=item_data['id_produto'])
            tamanho_produto_nome = item_data.get("tamanho_produto")
            tamanho_produto = TamanhoProduto.objects.filter(nome=tamanho_produto_nome).first()
            acrescimos = Acrescimos.objects.filter(nome__in=item_data['acrescimos'])

            ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                tamanho=tamanho_produto,
            ).acrescimos.set(acrescimos)

        return pedido