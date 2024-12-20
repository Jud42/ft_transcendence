from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/$', consumers.Consumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>\w+)/$', consumers.Consumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
