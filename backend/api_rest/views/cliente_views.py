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
        # A consulta considera apenas os dados do usuário autenticado
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
        # Retorna a lista de pedidos para o usuário autenticado.
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
        # Salva o pedido diretamente para o usuário autenticado.
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cliente=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
