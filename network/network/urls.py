from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("users/<str:username>", views.view_user, name="view_user"),
    path("following", views.following, name="following"),
    path("follow/<int:followerid>/<int:followeeid>", views.follow, name="follow"),
    path("unfollow/<int:followerid>/<int:followeeid>", views.unfollow, name="follow"),
    path("editpost", views.editpost, name="edit_post"),
    path("like", views.like, name="like_post"),
    path("unlike", views.unlike, name="unlike_post")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
