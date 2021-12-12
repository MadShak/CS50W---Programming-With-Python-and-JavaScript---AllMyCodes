document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', event => {
    event.preventDefault();
  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(() => {
      load_mailbox('sent');
    });
  });

  document.querySelector('#archive-btn').addEventListener('click', () => {
    fetch(`/emails/${sessionStorage.getItem('email_id')}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: (sessionStorage.getItem('archived') !== 'true')
      })
    })
    .then(() => {
      load_mailbox('inbox');
    });
  });

  document.querySelector('#reply-btn').addEventListener('click', () => {
    let emailContents = {
      timestamp: document.querySelector('#email-timestamp').textContent,
      sender: document.querySelector('#email-sender').textContent,
      subject: document.querySelector('#email-subject').textContent,
      body: document.querySelector('#email-body').textContent
    };
    reply_email(emailContents);

  });
});

function reply_email(originalEmail) {
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#displayemail-view').style.display = 'none';

  let subjectText = originalEmail.subject.startsWith('Re:') ? originalEmail.subject : `Re: ${originalEmail.subject}`;

  document.querySelector('h3').innerHTML = 'Email Reply';
  document.querySelector('#compose-recipients').value = originalEmail.sender;
  document.querySelector('#compose-subject').value = subjectText;
  document.querySelector('#compose-body').innerHTML = `\n\n"On ${originalEmail.timestamp} ${originalEmail.sender} wrote: &#10;${originalEmail.body}"`;
  document.querySelector('#compose-body').focus();
}

function compose_email() {
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#displayemail-view').style.display = 'none';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#displayemail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(element => {
      let emailElement = document.createElement('div');
      emailElement.classList.add('email');
      emailElement.setAttribute('data-id', `${element.id}`);

      if (element.read === true) {
        emailElement.classList.add('email-read');
      } else {
        emailElement.classList.add('email-unread');
      }

      emailElement.addEventListener('click', event => {
        let clickedElement = event.target;
        let email_id;        
        
        if (clickedElement.parentElement.dataset.id != null) {
          email_id = clickedElement.parentElement.dataset.id;
        } else {
          email_id = clickedElement.dataset.id;
        }
        document.querySelector('#displayemail-view').style.display = 'block';
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';

        fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
          displayEmail(email, mailbox);
        });
      });

      emailElement.innerHTML = `<p class="sender">${element.sender}</p><span class="timestamp">${element.timestamp}</span><p class="subject">${element.subject}</p>`;
      document.querySelector('#emails-view').appendChild(emailElement);
    });
  });
}

function displayEmail(email, mailbox) {
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;
  document.querySelector('#email-sender').innerHTML = email.sender;
  document.querySelector('#email-body').innerHTML = email.body;
  document.querySelector('#email-recipients').innerHTML = email.recipients.join(', ');
  
  sessionStorage.setItem('email_id', email.id);
  sessionStorage.setItem('archived', email.archived);

  toggleArchive(mailbox, email.archived);

  if (email.read === false) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
}

function toggleArchive(mailbox, archivedStatus) {
  if (mailbox === 'sent') {
    document.querySelector('#archive-btn').style.display = true;
    return;
  }

  let archiveButtonText = archivedStatus ? 'Unarchive' : 'Archive';
  document.querySelector('#archive-btn').innerHTML = archiveButtonText;
}