from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from decouple import config


@api_view(['POST'])
def generate_token(request):
    username = config('API_USERNAME')
    password = config('API_PASSWORD')

    from django.contrib.auth.models import User
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password(password)
        user.save()

    refresh = RefreshToken.for_user(user)
    return JsonResponse({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })
