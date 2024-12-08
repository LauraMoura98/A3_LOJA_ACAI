from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema

from api_rest.models import Pedido, ItemPedido
from api_rest.serializers import PedidoSerializer, ItemPedidoSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/pedidos/{id}/',
    responses={
        200: PedidoSerializer,
        404: 'Pedido não encontrado'
    }
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/pedidos/{id}/',
    responses={
        204: 'Pedido deletado com sucesso',
        404: 'Pedido não encontrado'
    }
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/pedidos/{id}/',
    request_body=PedidoSerializer,
    responses={
        200: PedidoSerializer,
        400: 'Erro de validação',
        404: 'Pedido não encontrado'
    }
)
@api_view(['GET', 'DELETE', 'PUT'])
@permission_classes([IsAuthenticated])
def pedido_por_id(request, id):
    try:
        pedido = Pedido.objects.get(pk=id, cliente=request.user)
    except Pedido.DoesNotExist:
        return Response(
            {"erro": "Pedido não encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        try:
            pedido.delete()
            return Response(
                {"mensagem": "Pedido deletado com sucesso"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"erro": f"Erro {e} ao tentar deletar o pedido"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'PUT':
        serializer = PedidoSerializer(
            pedido,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/pedidos/',
)
@swagger_auto_schema(
    method='post',
    operation_description='POST api/v1/pedidos/',
    request_body=PedidoSerializer,
    responses={201: PedidoSerializer, 400: 'Erro de validação'}
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def pedidos_geral(request):

    if request.method == 'GET':
        pedidos = Pedido.objects.filter(cliente=request.user)

        serializer = PedidoSerializer(pedidos, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cliente=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(status=status.HTTP_400_BAD_REQUEST)
