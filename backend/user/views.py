from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from .backend import CustomAuthenticationBackend

class login(View):
    async def get(self, request):
        return render(request, "login.html")

    async def post(self, request):
        user = CustomAuthenticationBackend.authenticate(request)
        if user is not None:
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=407)