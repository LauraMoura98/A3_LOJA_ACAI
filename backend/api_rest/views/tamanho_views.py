from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

from api_rest.models import Tamanho
from api_rest.serializers import TamanhoSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/tamanhos/{id}',
    responses={200: TamanhoSerializer, 404: "Tamanho não encontrado."}
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/tamanhos/{id}',
    responses={204: 'Tamanho deletado com sucesso.', 404: 'Tamanho não encontrado.'}
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/tamanhos/{id}',
    request_body=TamanhoSerializer,
    responses={200: TamanhoSerializer, 400: 'Erro de validação.', 404: 'Tamanho não encontrado.'}
)
@api_view(['GET', 'DELETE', 'PUT'])
def tamanhos_por_id(request, id):
    try:
        tamanho = Tamanho.objects.get(pk=id)
    except Tamanho.DoesNotExist:
        return Response({"erro": "Tamanho não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TamanhoSerializer(tamanho)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        tamanho.delete()
        return Response({"mensagem": "Tamanho deletado com sucesso."}, status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        serializer = TamanhoSerializer(tamanho, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

@swagger_auto_schema(
    method='post',
    request_body=TamanhoSerializer,
    operation_description='POST api/v1/Tamanhos/',
    responses={201: TamanhoSerializer, 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/Tamanhos/',
)
@api_view(["POST", "GET"])
def tamanhos_geral(request):
    if request.method == "GET":
        Tamanhos = Tamanho.objects.all()
        serializer = TamanhoSerializer(Tamanhos, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = TamanhoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
