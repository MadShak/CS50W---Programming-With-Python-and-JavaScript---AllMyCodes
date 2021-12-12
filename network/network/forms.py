from django.forms import ModelForm, Form, Textarea
from .models import Post, Follow, Comment

class PostForm(ModelForm):
    class Meta:
        model = Post
        fields = ['postbody']
        labels = {
            'postbody': "Post"
        }
    def __init__(self, *args, **kwargs):
        super(PostForm, self).__init__(*args, **kwargs)
        self.fields['postbody'].widget.attrs\
            .update({
                'placeholder': "Rock!",
                'class': 'mb-1 p-2',
                'id': 'postinput'
            })