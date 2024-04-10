document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Get composition fields
  let recipients = document.querySelector('#compose-recipients');
  let subject = document.querySelector('#compose-subject');
  let body = document.querySelector('#compose-body');

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

  // Send the email when compose-form is submitted
  document.querySelector('#compose-form').onsubmit = function() {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
      })
    })
    .then(response => response.json())
    .then(result => {
      if ('message' in result) {
        // If request is success, redirect user to inbox page
        load_mailbox('inbox');

        // Display success message to user
        displayMessage(result['message'], 'alert-success');
      }
      else {
        // If request isn't success, display error message to user
        displayMessage(result['error'], 'alert-danger');
      }
    })

    // Stop form from submitting
    return false
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Make GET request for mailbox data.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Iltrate on each email
    emails.forEach(function(email) {
      console.log(email);
      // Create all divs we need
      let box = document.createElement('div');
      let sender = document.createElement('div');
      let subject = document.createElement('div');
      let timestamp = document.createElement('div');

      // Set correct classes
      box.classList.add('box');
      sender.className = 'sender';
      subject.className = 'subject';
      timestamp.className = 'timestamp';

      // Set box values
      box.id = email['id'];
      if (email['read']) {
        box.classList.add('readed');
      }
      else {
        box.classList.add('unreaded');
      }
      box.addEventListener('click', function() {
        load_email(box.id);
      });

      // Set inner html values
      sender.innerHTML = email['sender'];
      subject.innerHTML = email['subject'];
      timestamp.innerHTML = email['timestamp'];

      // Add parts of email to the box
      box.append(sender);
      box.append(subject);
      box.append(timestamp);

      document.querySelector('#emails-view').append(box);
    })
  })
  .catch(error => {
    displayMessage(error, 'alert-danger');
  });
}

function displayMessage(message, Class) {
  // Get message element
  messageElement = document.querySelector('#message');
  // Update message element html value
  messageElement.innerHTML = message

  // Add alert classes and style it
  messageElement.className = `alert ${Class}`;
  messageElement.style.display = 'block';

  // If message class is success, remove message after display it
  if (Class === 'alert-success') {
    messageElement.style.animationPlayState = 'running';
    messageElement.addEventListener('animationend', () => {
      messageElement.remove();
    });
  }
}

function load_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(data => {
    document.querySelector('#from').innerHTML = data['sender'];
    document.querySelector('#to').innerHTML = data['recipients'];
    document.querySelector('#subject').innerHTML = data['subject'];
    document.querySelector('#timestamp').innerHTML = data['timestamp'];
    document.querySelector('#body').innerHTML = data['body'];
  })

  .catch(error => {
    displayMessage(error, 'alert-danger');
  });

  // Mark as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
}