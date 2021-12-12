document.addEventListener('DOMContentLoaded', function() {
    const followbutton = document.querySelector("#follow");
    const unfollowbutton = document.querySelector("#unfollow");
    if (followbutton) {
        followbutton.addEventListener('click', follow);
    }
    if (unfollowbutton) {
        unfollowbutton.addEventListener('click', unfollow);
    }

    document.querySelectorAll('.editpost').forEach(post => {
        post.onclick = function() {
            editPost(this.dataset.postid);
        }
    });

    document.querySelectorAll('.like').forEach(post => {
        post.addEventListener('click', () => likePost(post.dataset.postid));
    });


    document.querySelectorAll('.unlike').forEach(post => {
        post.addEventListener('click', () => unlikePost(post.dataset.postid));
    });
});

function follow() {
    const follower = document.querySelector("#follow").dataset.followerid;
    const followee = document.querySelector("#follow").dataset.followeeid;
    url = "/follow/" + follower + "/" + followee
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result['message'] === "success") {
                document.querySelector("#follow").innerHTML = "Unfollow";
                document.querySelector("#follow").id = "unfollow";
                document.querySelector("#unfollow").addEventListener('click', unfollow);
                let followercount = result['followers']
                document.querySelector('#followercount').innerHTML = followercount;
                if (followercount === 1) {
                    document.querySelector('#followerlabel').innerHTML = "Follower";
                } else {
                    document.querySelector('#followerlabel').innerHTML = "Followers";
                }
            } else {
                p = document.createElement('p');
                p.innerHTML = result['message'];
                document.querySelector("#followbuttons").appendChild(p);
            }
        });
    return false;
}

function unfollow() {
    const follower = document.querySelector("#unfollow").dataset.followerid;
    const followee = document.querySelector("#unfollow").dataset.followeeid;
    url = "/unfollow/" + follower + "/" + followee
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result['message'] === "success") {
                document.querySelector("#unfollow").innerHTML = "Follow";
                document.querySelector("#unfollow").id = "follow";
                document.querySelector("#follow").addEventListener('click', follow);
                let followercount = result['followers']
                document.querySelector('#followercount').innerHTML = followercount;
                if (followercount === 1) {
                    document.querySelector('#followerlabel').innerHTML = "Follower";
                } else {
                    document.querySelector('#followerlabel').innerHTML = "Followers";
                }
            } else {
                p = document.createElement('p');
                p.innerHTML = result['message'];
                document.querySelector("#followbuttons").appendChild(p);
            }
        });
    return false;
}

function editPost(postid) {
    postp = document.querySelector(`#post-${postid}`);
    postp.style.display = 'none';
    document.querySelector(`#editpost-${postid}`).style.display = 'none';
    document.querySelector(`#editpostform-${postid}`).style.display = 'block';
}

function likePost(postid) {
    const csrftoken = getCookie('csrftoken')
    console.log(csrftoken)

    fetch("/like", {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                postid: postid
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result['message'] === "success") {
                document.querySelector(`#heart-${postid}`).src = "/static/network/heart.png"
                let likes = parseInt(document.querySelector(`#likes-${postid}`).innerHTML);
                console.log(likes);
                likes++;
                console.log(likes);
                if (likes === 1) {
                    document.querySelector(`#likes-${postid}`).innerHTML = likes + " Like";
                } else {
                    document.querySelector(`#likes-${postid}`).innerHTML = likes + " Likes";
                }
                document.querySelectorAll('.like').forEach(post => {
                    if (post.dataset.postid === postid) {
                        classes = post.className.replace('like', 'unlike');
                        post.className = classes;
                        post.removeEventListener('click', () => likePost(post.dataset.postid));
                        post.addEventListener('click', () => unlikePost(post.dataset.postid));
                    }
                });
            } else {
                p = document.createElement('p');
                p.innerHTML = result['message'];
                document.querySelector(`#like-${postid}`).appendChild(p);
            }
        })
}

function unlikePost(postid) {
    const csrftoken = getCookie('csrftoken')
    console.log(csrftoken)

    fetch("/unlike", {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                postid: postid
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result['message'] === "success") {
                document.querySelector(`#heart-${postid}`).src = "/static/network/like.png"
                let likes = parseInt(document.querySelector(`#likes-${postid}`).innerHTML);
                console.log(likes);
                likes--;
                console.log(likes);
                if (likes === 1) {
                    document.querySelector(`#likes-${postid}`).innerHTML = likes + " Like";
                } else {
                    document.querySelector(`#likes-${postid}`).innerHTML = likes + " Likes";
                }
                document.querySelectorAll('.unlike').forEach(post => {
                    if (post.dataset.postid === postid) {
                        classes = post.className.replace('unlike', 'like');
                        post.className = classes;
                        post.removeEventListener('click', () => unlikePost(post.dataset.postid));
                        post.addEventListener('click', () => likePost(post.dataset.postid));
                    }
                });
            } else {
                p = document.createElement('p');
                p.innerHTML = result['message'];
                document.querySelector(`#like-${postid}`).appendChild(p);
            }
        })
}

function getCookie(name) {
    if (!document.cookie) {
        return null;
    }
    const token = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));

    if (token.length === 0) {
        return null;
    }
    return decodeURIComponent(token[0].split('=')[1]);
}