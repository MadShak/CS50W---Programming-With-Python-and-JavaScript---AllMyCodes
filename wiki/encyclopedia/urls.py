from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("edit/<str:title>", views.edit, name="edit"),
    path("wiki/<str:title>", views.wiki_title, name="title"),
    path("random", views.random, name="random"),
    path("new", views.new, name="new")
]
