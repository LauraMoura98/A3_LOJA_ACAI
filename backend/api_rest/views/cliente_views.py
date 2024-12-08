from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from api_rest.serializers import (
    RegistroUsuarioSerializer,
    CustomTokenObtainPairSerializer,
    PedidoSerializer,
)

from api_rest.models.pedido import Pedido
from api_rest.models.tamanho_produto import TamanhoProduto
from api_rest.models.produto import Produto
from api_rest.models.acrescimos import Acrescimos
from api_rest.models.item_pedido import ItemPedido


class RegistroUsuarioViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        request_body=RegistroUsuarioSerializer,
        responses={
            201: "Usuário criado com sucesso",
            400: "Erro nos dados enviados"
        },
    )
    def create(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuário criado com sucesso"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUsuarioView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @swagger_auto_schema(
        request_body=CustomTokenObtainPairSerializer,
        responses={
            200: "Login realizado com sucesso",
            401: "Credenciais inválidas"
        },
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PedidoViewSet(ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas os pedidos do usuário autenticado
        return Pedido.objects.filter(cliente=self.request.user)

    @swagger_auto_schema(
        operation_summary="Listar pedidos do usuário autenticado",
        operation_description="Retorna todos os pedidos feitos pelo usuário atualmente autenticado.",
        responses={
            200: PedidoSerializer(many=True),
            403: "Autenticação necessária",
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=PedidoSerializer,
        operation_summary="Criar um novo pedido para o usuário autenticado",
        responses={
            201: "Pedido criado com sucesso",
            400: "Erro nos dados enviados",
            403: "Autenticação necessária",
        },
    )
    def create(self, request, *args, **kwargs):
        try:
            # Captura os dados do pedido
            serializer = self.get_serializer(data=request.data)

            if serializer.is_valid():
                # Cria o pedido vinculando automaticamente ao usuário autenticado
                pedido = serializer.save(cliente=request.user)

                # Processa os itens do pedido
                itens_pedido_data = request.data.get('itens_pedido', [])
                for item_data in itens_pedido_data:
                    try:
                        produto_id = item_data.get("produto_id")
                        tamanho_id = item_data.get("tamanho_id")
                        acrescimos_nomes = item_data.get("acrescimos", [])

                        # Obtém o produto e valida
                        produto = Produto.objects.get(id=produto_id)

                        # Obtém o tamanho e os acrescimos
                        tamanho_produto = TamanhoProduto.objects.filter(id=tamanho_id).first()
                        acrescimos = Acrescimos.objects.filter(nome__in=acrescimos_nomes)

                        # Cria o item do pedido
                        item_pedido = ItemPedido.objects.create(
                            pedido=pedido,
                            produto=produto,
                            tamanho=tamanho_produto,
                        )
                        item_pedido.acrescimos.set(acrescimos)
                        item_pedido.save()

                    except Produto.DoesNotExist:
                        return Response({"error": f"Produto com id {produto_id} não encontrado."},
                                        status=status.HTTP_400_BAD_REQUEST)
                    except Exception as e:
                        return Response({"error": f"Erro ao processar item do pedido: {str(e)}"},
                                        status=status.HTTP_400_BAD_REQUEST)

                # Retorna o pedido criado com sucesso
                return Response(self.get_serializer(pedido).data, status=status.HTTP_201_CREATED)

            # Retorna erros do serializer
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Captura qualquer erro inesperado
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
