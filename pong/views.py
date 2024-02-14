from django.http import Http404
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.http import JsonResponse
from .backend import CustomAuthenticationBackend
from .models import User, Game, Tournament
from dotenv import load_dotenv
import requests
import os

access_token = 0


@login_required
def profilPicture(request):
    if request.method == "POST":
        return JsonResponse({"foo": "bar"})
    else:
        return request.user.profilPictureUrl


def index(request, page_name=None):
    return render(request, "index.html", page_name)


@login_required
def home(request):
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request, "home.html", {"template": "ajax.html" if ajax else "index.html"}
    )


@login_required
def play(request):
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request, "play.html", {"template": "ajax.html" if ajax else "index.html"}
    )


@login_required
def profil(request):
    print("URL: " + request.user.profilPictureUrl)
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request, "profil.html", {"template": "ajax.html" if ajax else "index.html"}
    )


@login_required
def chat(request):
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request, "chat.html", {"template": "ajax.html" if ajax else "index.html"}
    )


@login_required
def lobby(request, game_id=None):
    if game_id is None:
        game = Game.objects.create()
        game.add_team()
        game.add_player(request.user)
        print("Game nbr: " + str(game.pk))
        return redirect(lobby, game.pk)
    game = Game.objects.get(pk=game_id)
    if request.method == "GET":
        ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        return render(
            request,
            "lobby.html",
            {"template": "ajax.html" if ajax else "index.html", "game_id": game_id},
        )
    elif request.method == "POST":
        added_player = request.POST.get("player")
        if added_player is not None:
            game.add_player(added_player)
            # return todo


@login_required
def game(request, game_id=None):
    if game_id is None:
        return redirect(home)
    game = Game.objects.get(pk=game_id)
    if game is None:
        return redirect(home)
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request,
        "game.html",
        {"template": "ajax.html" if ajax else "index.html", "game_id": game_id},
    )

@login_required
def lobby_tour(request, tournament_id=None):
    if tournament_id is None:
        tournament = Tournament.objects.create()
        tournament.add_team()
        tournament.add_player(request.user)
        print("Tournament nbr: " + str(tournament.pk))
        return redirect(lobby_tour, tournament.pk)
    tournament = Tournament.objects.get(pk=tournament_id)
    if request.method == "GET":
        ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        return render(
            request,
            "lobby_tour.html",
            {"template": "ajax.html" if ajax else "index.html", "tournament_id": tournament_id},
        )
    elif request.method == "POST":
        added_player = request.POST.get("player")
        if added_player is not None:
            tournament.add_player(added_player)
            # return todo


@login_required
def tournament(request, tournament_id=None):
    if tournament_id is None:
        return redirect(home)
    tournament = Game.objects.get(pk=tournament_id)
    if tournament is None:
        return redirect(home)
    ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    return render(
        request,
        "tournament.html",
        {"template": "ajax.html" if ajax else "index.html", "tournament_id": tournament_id},
    )

@login_required
def username(request):
    if request.method == "GET":
        return JsonResponse({"username": request.user.username})
    elif request.method == "POST":
        print(request.POST)
        new_username = request.POST.get("new_username")
        if new_username:
            request.user.username = new_username
            request.user.save()
            return JsonResponse({"message": "Username updated successfully"})
        else:
            return JsonResponse({"error": "New username is required"}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
def logoutview(request):
    logout(request)
    return loginview(request)


def loginview(request):
    token = request.headers.get("Authorization")
    if request.user.is_authenticated:
        redirect("/home")
    if request.method == "GET":
        ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        return render(
            request,
            "login.html",
            {"template": "ajax.html" if ajax else "index.html"},
        )
    elif request.method == "POST":
        user = CustomAuthenticationBackend.authenticate(request, token)
        if user is not None:
            next = request.POST.get("next")
            return redirect("/home" if next is None else next)
        else:
            load_dotenv()
            state = os.urandom(42)
            auth_url = "{}/oauth/authorize?client_id={}&redirect_uri={}&scope={}&state={}&response_type=code".format(
                os.getenv("OAUTH_URL"),
                os.getenv("OAUTH_ID"),
                requests.utils.quote("http://localhost:8000/accounts/callback/"),
                "public",
                123,  # state
            )
            return redirect(auth_url)


def callback(request):
    code = request.GET.get("code")
    state = request.GET.get("state")
    response = requests.post(
        "{}{}".format(os.getenv("OAUTH_URL"), os.getenv("OAUTH_TOKEN_URL")),
        data={
            "grant_type": "authorization_code",
            "client_id": os.getenv("OAUTH_ID"),
            "client_secret": os.getenv("OAUTH_SECRET"),
            "code": code,
            "redirect_uri": "http://localhost:8000/accounts/callback/",
            "state": state,
        },
        headers={"Accept": "application/json"},
    )
    if not response.ok:
        raise Http404("Status code is: " + response.status_code)
    access_token = response.json()["access_token"]

    response = requests.get(
        os.getenv("OAUTH_USER_URL"),
        headers={"Authorization": "Bearer " + access_token},
    )

    try:
        user = User.objects.get(username=response.json()["login"])
    except User.DoesNotExist:
        user = User.objects.create_user(username=response.json()["login"])
        print("USER CREATED")
        try:
            user.profilPictureUrl = response.json()["image"]["link"]
        except KeyError:
            user.profilPictureUrl = "https://github.com/{}.png".format(user.username)
        #"https://assets.justinmind.com/wp-content/uploads/2018/11/Lorem-Ipsum-alternatives.png"
        print("PP set to: " + user.profilPictureUrl)
        user.save()

    user.access_token = access_token
    login(request, user)
    return render(request, "callback.html", {"access_token": access_token})
