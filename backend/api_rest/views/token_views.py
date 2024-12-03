from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings


@csrf_exempt
def get_auth_data(request):
    return JsonResponse({
        "username": settings.AUTH_API["username"],
        "password": settings.AUTH_API["password"]
    })
