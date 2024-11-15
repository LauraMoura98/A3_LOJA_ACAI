from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

from api_rest.models import Acrescimos
from api_rest.serializers import AcrescimoSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/acrescimos/{id}',
    responses={
        200: AcrescimoSerializer,
        404: "Acrescimo não encontrado."
    }
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/acrescimos/{id}',
    responses={
        204: 'Produto deletado com sucesso.',
        404: 'Produto não encontrado.'
    }
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/produtos/{id}',
    request_body=AcrescimoSerializer,
    responses={
        200: AcrescimoSerializer,
        400: 'Erro de validação.',
        404: 'Produto não encontrado.'
    }
)
@api_view(['GET', 'DELETE', 'PUT'])
def acrescimos_por_id(request, id):
    try:
        acrescimo = Acrescimos.objects.get(pk=id)
    except Acrescimos.DoesNotExist:
        return Response({
            "erro": "Produto não encontrado."
        }, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == 'GET':
        serializer = AcrescimoSerializer(acrescimo)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        try:
            acrescimo.delete()
            return Response({
                "mensagem": "Acrescimo deletado com sucesso."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response({
                "erro": f'Erro {e} ao tentar deletar acrescimo.'
            }
            )
    elif request.method == 'PUT':
        serializer = AcrescimoSerializer(
            acrescimo,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=AcrescimoSerializer,
    operation_description='POST api/v1/produtos/',
    responses={201: AcrescimoSerializer, 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/produtos/',
)
@api_view(["POST", "GET"])
def acrescimos_geral(request):
    if request.method == "POST":
        serializer = AcrescimoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    elif request.method == "GET":
        produtos = Acrescimos.objects.all()
        serializer = AcrescimoSerializer(produtos, many=True)
        return Response(serializer.data)

    return Response(status=status.HTTP_400_BAD_REQUEST)
