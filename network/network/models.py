from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="user_posts")
    postbody = models.TextField(max_length=1000)
    timestamp = models.DateTimeField()
    likes = models.ManyToManyField(User, blank=True, related_name="liked_posts")

    def __str__(self):
        return f"Post by {self.user} on {self.timestamp}"

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed_accounts")
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    def __str__(self):
        return f"User {self.follower} is following user {self.followee}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_comments")
    comment = models.TextField(max_length=1000)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"User {self.user} comment on post {self.post} on {self.timestamp}"