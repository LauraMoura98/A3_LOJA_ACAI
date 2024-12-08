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
            serializer = self.get_serializer(data=request.data)

            # Verifique os dados recebidos no POST
            print("Dados recebidos no POST:", request.data)

            if serializer.is_valid():
                pedido = serializer.save(cliente=request.user)

                # Verifique a criação do pedido
                print("Pedido salvo:", pedido)

                # Processando itens do pedido
                itens_pedido_data = request.data.get('itens_pedido', [])
                for item_data in itens_pedido_data:
                    try:
                        produto_id = item_data.get("id_produto")
                        tamanho_produto_nome = item_data.get("tamanho_produto")
                        acrescimos_nome = item_data.get("acrescimos", [])

                        # Validação dos dados do produto
                        produto = Produto.objects.get(id=produto_id)

                        # Validando tamanho e acrescimos
                        tamanho_produto = TamanhoProduto.objects.filter(nome=tamanho_produto_nome).first()
                        acrescimos = Acrescimos.objects.filter(nome__in=acrescimos_nome)

                        # Criando item do pedido
                        item_pedido = ItemPedido.objects.create(
                            pedido=pedido,
                            produto=produto,
                            tamanho=tamanho_produto,
                        )
                        item_pedido.acrescimos.set(acrescimos)
                        item_pedido.save()

                        # Log da criação do item
                        print("Item do pedido salvo:", item_pedido)

                    except Exception as e:
                        # Log detalhado sobre erro no item
                        print(f"Erro ao processar item de pedido: {e}")

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            # Caso o serializer seja inválido
            print("Erro no serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            # Log completo da exceção
            print("Erro fatal no método create:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

