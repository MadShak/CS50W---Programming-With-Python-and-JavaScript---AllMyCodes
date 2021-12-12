from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import sys
import datetime
import json

from .models import User, Post, Follow, Comment
from .forms import PostForm


def index(request):
    form = PostForm()
    allposts = Post.objects.all().order_by("-timestamp")
    paginator = Paginator(allposts, 10)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    if request.user.is_authenticated:
        liked_posts = request.user.liked_posts.all()
    else:
        liked_posts = []
    return render(request, "network/index.html", {
        'form': form,
        'posts': posts,
        'title': "All Posts",
        'liked_posts': liked_posts
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required()
def post(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            post = Post()
            post.user = request.user
            post.postbody = form.cleaned_data['postbody']
            post.timestamp = datetime.datetime.now()
            post.save()
            newform = PostForm()
            allposts = Post.objects.all().order_by("-timestamp")
            paginator = Paginator(allposts, 10)
            page_number = request.GET.get('page')
            posts = paginator.get_page(page_number)
            return render(request, "network/index.html", {
                "message_success": "Posted",
                "form": newform,
                "posts": posts,
                "title": "All Posts"
            })
        else:
            allposts = Post.objects.all().order_by("-timestamp")
            paginator = Paginator(allposts, 10)
            page_number = request.GET.get('page')
            posts = paginator.get_page(page_number)
            return render(request, "network/index.html", {
            "message_error": "Error, please try again",
            "form": form,
            "posts": posts,
            "title": "All Posts"
        })
    else:
        return HttpResponseRedirect(reverse("index"))

def view_user(request, username):
    account = User.objects.get(username=username)
    followers = account.followers.count()
    following = account.followed_accounts.count()
    if account.followers.filter(follower=request.user).exists():
        follower = True
    else:
        follower = False

    allposts = account.user_posts.all().order_by("-timestamp")
    paginator = Paginator(allposts, 10)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    return render(request, "network/profile.html", {
        "account": account,
        "followers": followers,
        "following": following,
        "posts": posts,
        "follower": follower
    })

@login_required()
def follow(request, followerid, followeeid):
    follower = User.objects.get(pk=followerid)
    followee = User.objects.get(pk=followeeid)
    if not follower or not followee:
        return JsonResponse({
            "message": "Invalid follower or followee ID."
        })
    follow = Follow()
    follow.follower = follower
    follow.followee = followee
    follow.save()
    followers = followee.followers.count()
    return JsonResponse({
        "message": "success",
        "followers": followers
    })

@login_required()
def unfollow(request, followerid, followeeid):
    follower = User.objects.get(pk=followerid)
    followee = User.objects.get(pk=followeeid)
    follow = Follow.objects.get(follower=follower, followee=followee)
    if not follow:
        return JsonResponse({
            "message": "Invalid follower or followee ID."
        })
    follow.delete()
    followers = followee.followers.count()
    return JsonResponse({
        "message": "success",
        "followers": followers
    })

@login_required()
def following(request):
    user = request.user
    following = user.followed_accounts.all()
    followedaccounts = []
    for account in following:
        followedaccounts.append(account.followee)
    allposts = Post.objects.filter(user__in=followedaccounts).order_by("-timestamp")
    paginator = Paginator(allposts, 10)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    form = PostForm()
    title = "Your followers posts..."
    return render(request, "network/index.html", {
        'form': form,
        'posts': posts,
        'title': title,
        'followedaccounts': followedaccounts
    })

@login_required()
def editpost(request):
    if request.method == "POST":
        postid = request.POST.get('postid','')
        post = Post.objects.get(pk=postid)
        if post.user == request.user:
            post.postbody = request.POST.get('postbody','')
            post.timestamp = datetime.datetime.now()
            post.save()
            newform = PostForm()
            allposts = Post.objects.all().order_by("-timestamp")
            paginator = Paginator(allposts, 10)
            page_number = request.GET.get('page')
            posts = paginator.get_page(page_number)
            return render(request, "network/index.html", {
                "message_success": "Posted",
                "form": newform,
                "posts": posts,
                "title": "All Posts"
            })
        else:
            return HttpResponseRedirect(reverse("index"))
    else:
        return HttpResponseRedirect(reverse("index"))

@login_required()
def like(request):
    if request.method == "POST":
        data = json.loads(request.body)
        postid = data.get('postid')
        post = Post.objects.get(pk=postid)
        post.likes.add(request.user)
        post.save()
        return JsonResponse({
            "message": "success"
    })
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

@login_required()
def unlike(request):
    if request.method == "POST":
        data = json.loads(request.body)
        postid = data.get('postid')
        post = Post.objects.get(pk=postid)
        post.likes.remove(request.user)
        post.save()
        return JsonResponse({
            "message": "success"
    })
    else:
        return JsonResponse({"error": "POST request required."}, status=400)