from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings


@api_view(['POST'])
def generate_token(request):

    username = settings.API_USERNAME
    password = settings.API_PASSWORD

    if username and password:

        refresh = RefreshToken.for_user(request.user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    else:
        return Response({"detail": "Credenciais inválidas."}, status=400)
