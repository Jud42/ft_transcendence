from .models import User
from django.contrib.auth.backends import BaseBackend


class CustomAuthenticationBackend(BaseBackend):
    def authenticate(self, request, token=None):
        if token is None:
            return None
        print("TOKEN: " + token)
        try:
            user = User.objects.get(access_token=token)
            return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            print("Trying to get user " + user_id)
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None