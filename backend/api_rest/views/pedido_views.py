from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

from api_rest.models import Pedido
from api_rest.serializers import PedidoSerializer


@swagger_auto_schema(
    method='post',
    request_body=PedidoSerializer,
    operation_description='POST api/v1/pedidos/',
    responses={201: PedidoSerializer, 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/pedidos/',
)
@api_view(["POST", "GET"])
def pedidos_geral(request):
    if request.method == "GET":
        pedidos = Pedido.objects.all()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/pedidos/{id}',
    responses={200: PedidoSerializer, 404: "Pedido não encontrado."}
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/pedidos/{id}',
    responses={204: 'Pedido deletado com sucesso.', 404: 'Pedido não encontrado.'}
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/pedidos/{id}',
    request_body=PedidoSerializer,
    responses={200: PedidoSerializer, 400: 'Erro de validação.', 404: 'Pedido não encontrado.'}
)
@api_view(['GET', 'DELETE', 'PUT'])
def pedidos_por_id(request, id):
    try:
        pedido = Pedido.objects.get(pk=id)
    except Pedido.DoesNotExist:
        return Response({"erro": "Pedido não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        pedido.delete()
        return Response({"mensagem": "Pedido deletado com sucesso."}, status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        serializer = PedidoSerializer(pedido, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
