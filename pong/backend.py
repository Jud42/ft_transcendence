from .models import CustomUser
from django.contrib.auth.backends import BaseBackend


class CustomAuthenticationBackend(BaseBackend):
    
    def authenticate(self, request, token=None):
        if token is None:
            return None
        try:
            return CustomUser.objects.get(access_token=token)
        except CustomUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None
        
class CustomAuthCred(BaseBackend):
    """
    Authenticate against the settings ADMIN_LOGIN and ADMIN_PASSWORD.

    Use the login name and a hash of the password. For example:

    ADMIN_LOGIN = 'admin'
    ADMIN_PASSWORD = 'pbkdf2_sha256$30000$Vo0VlMnkR4Bk$qEvtdyZRWTcOsCnI/oQ7fVOu1XAURIZYoOZ3iq8Dr4M='
    """

    def authenticate(self, request, username=None, password=None):
        #login_valid = settings.ADMIN_LOGIN == username
        #pwd_valid = check_password(password, settings.ADMIN_PASSWORD)
        #if login_valid and pwd_valid:
        try:
            user = CustomUser.objects.get(username=username)
            if user.password == password:
                return user
            return None
        except CustomUser.DoesNotExist:
            # Create a new user. There's no need to set a password
            # because only the password from settings.py is checked.
            #user = User(username=username)
            #user.is_staff = True
            #user.is_superuser = True
            #user.save()
            #return user
            return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None