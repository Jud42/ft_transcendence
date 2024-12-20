from django.views.generic.base import RedirectView
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from . import views
# from .views import create_fake_user

urlpatterns = [
    path("", views.home, name="home"),
    path("", views.index),
    path("favicon.ico", RedirectView.as_view(url=static("img/favicon/favicon.ico")[0])),
    path("accounts/login/", views.loginview),
    path("accounts/login-form/", views.loginview_two),
    path("accounts/signup/", views.signupview),
    path("accounts/callback/", views.callback),
    path("accounts/logout/", views.logoutview),
    path("accounts/profil/", views.profil),
    path("accounts/profil/", views.profil_view, name="profil_view"),
    path("accounts/profil/picture/", views.profilPicture),
    path("accounts/profil/nickname/", views.nickname),
    path("accounts/profil/username/", views.username),
    path("accounts/profil/settings/", views.UpdateUserSettingsView),
    path("profil/settings/data/", views.getUserData),


    path("home/", views.home, name="home"),
    path("chat/", views.chat),
    path("chat/chat-tmp/", views.chat),
    path("play/", views.play),
    path("profil/", views.profil),
    path("error/", views.errorview),
    path("user/", views.user),
    path("user/<str:nickname>/", views.user),
    path("users/list", views.get_users),
    path("update-status/", views.update_status, name="update_status"),
    path("check/", views.update_status, name="update_status"),


    
    path("lobby/", views.lobby),
    path("lobby/<int:gameId>/", views.lobby),
    path("game/<int:gameId>/", views.game),
    path("game/<int:gameId>/get-nickname/", views.get_nicknames),
    path("game/<int:gameId>/get-scores/", views.get_scores),
    path("game/<int:gameId>/decline/", views.decline_game_invite, name="decline_game_invite"),
    
    path("remLobby/", views.remLobby),
    path("remLobby/<str:invitedPlayer2>/", views.remLobby),
    path("remote/", views.remote),
    path("remote/<int:remoteId>/", views.remote),
    
    path("tourLobby/", views.tourLobby),
    path("tourLobby/<int:tournamentId>/", views.tourLobby),
    path("tournament/<int:tournamentId>/next/", views.tournament_next),
    path("tournament/game/<int:gameId>/", views.tournament_game),
    path("tournament/<int:gameId>/get-nickname/", views.get_nicknames),

    # path("api/create-fake-user/", create_fake_user, name="create_fake_user"),
   
    path("chat/conversations/", views.get_user_conversations),
    path("chat/conversation/<str:username>/", views.get_conversation),
    
    path("<path:prefix>/getList/<str:type>", views.getList),
    path("<path:prefix>/manageFriend/<str:action>/<str:nickname>/", views.manageFriend),    
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
