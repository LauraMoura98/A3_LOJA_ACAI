from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

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
 