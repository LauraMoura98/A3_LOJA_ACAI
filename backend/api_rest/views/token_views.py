from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings


@api_view(['POST'])
def generate_token(request):
    # Aqui você já está acessando as credenciais do settings
    username = settings.API_USERNAME
    password = settings.API_PASSWORD

    # Verificando se o username e password estão corretos (essa lógica deve ser ajustada conforme sua necessidade)
    if username == request.data.get('username') and password == request.data.get('password'):
        # Autenticar o usuário (deve ter um mecanismo de autenticação como User.objects.get...)
        user = request.user  # Ou use seu próprio método de autenticação, por exemplo, buscar usuário no banco

        refresh = RefreshToken.for_user(user)  # Criar o token JWT para o usuário
        return Response({
            'access': str(refresh.access_token),  # Token de acesso
            'refresh': str(refresh),  # Token de refresh
        })
    else:
        return Response({"detail": "Credenciais inválidas."}, status=400)
