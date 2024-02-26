from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import Game, Message, User
from pong.player import Player


class Consumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.game = None
        self.player = None

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
        self.user.online = True
        async for chat in User.objects.filter(chats=self.user):
            self.channel_layer.group_add(f"chat_{chat.pk}", self.channel_name)
            print(f"user {self.user.username} added to user {chat.pk}'s channel group")
        self.channel_layer.group_send(
            "server", {"type": "connection", "user": self.user.username}
        )
        self.channel_layer.group_add("server", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        self.user.online = False
        await self.channel_layer.group_discard("server", self.channel_name)
        self.channel_layer.group_send(
            "server", {"type": "disconnection", "user": self.user.username}
        )
        async for chat in User.objects.filter(chats=self.user):
            self.channel_layer.group_discard(f"chat_{chat.pk}", self.channel_name)

    async def receive_json(self, content):
        print(content)
        if "type" not in content:
            return
        if content["type"] == "game_move":
            await self.handle_key_press(content.get("direction"))
        elif content["type"] == "game_join":
            await self.join_game(content)
        elif content["type"] == "player_ready":
            self.player.ready = True
            await self.game.ready(self.user)
        elif content["type"] == "player_pause":
            await self.game.pause(self.player)
        elif content["type"] == "chat_message":
            await self.receive_chat(content)
        else:
            print(f"Unknown message type: {content['type']}")

    async def join_game(self, content):
        self.game = await Game.objects.aget(pk=content.get("game_id"))
        self.player = Player(self, 0, 0)
        self.game.players.append(self.player)
        await self.channel_layer.group_add(
            f"game_{self.game.pk}", self.channel_name
        )
    
    async def leave_game(self):
        await self.channel_layer.group_discard(f"game_{self.game.pk}", self.channel_name)


    async def receive_chat(self, content):
        target = "Davokadoh"  # content.get("chat")
        chat = await User.objects.aget(username=target)
        await self.channel_layer.group_add(f"chat_{chat.pk}", self.channel_name)
        await Message.objects.acreate(
            sender=self.user, target=chat, message=content.get("message")
        )
        await self.channel_layer.group_send(f"chat_{chat.pk}", content)

    async def connection(self, content):
        await self.send_json(content)

    async def disconnection(self, content):
        await self.send_json(content)

    async def chat_message(self, content):
        await self.send_json(content)

    async def game_ready(self, content):
        await self.send_json(content)

    async def pause_refused(self, content):
        await self.send_json(content)

    async def game_status(self, content):
        await self.send_json(content)

    async def game_update(self, content):
        await self.send_json(content)

    async def game_score(self, content):
        await self.send_json(content)

    async def handle_key_press(self, direction):
        if direction == "UP":
            self.player.speed_y = -1
        elif direction == "DOWN":
            self.player.speed_y = 1
