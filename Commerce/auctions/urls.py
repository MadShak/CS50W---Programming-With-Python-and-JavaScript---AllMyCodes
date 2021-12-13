from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("logout", views.logout_view, name="logout"),
    path("create", views.create, name="create"),
    path("login", views.login_view, name="login"),
    path("register", views.register, name="register"),
    path("categories", views.category, name="categories"),
    path("watch_list/<str:user_id>", views.watchlist, name="watchlist"),
    path("remove_watchlist/<str:listing_id>", views.remove_watchlist, name="remove_watchlist"),
    path("add_watchlist/<str:listing_id>", views.add_watchlist, name="add_watchlist"),
    path("bidding/<str:listing_id>", views.bidding, name="bidding"),
    path("close/<str:listing_id>", views.close, name="close"),
    path("listing/<str:listing_id>", views.listing, name="listing")
]
