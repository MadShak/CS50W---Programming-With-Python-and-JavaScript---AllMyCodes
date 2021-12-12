from django.contrib import admin
from .models import User, Post, Follow, Comment

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    pass

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    pass

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    pass