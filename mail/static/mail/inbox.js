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
        // Redirect user to inbox page
        load_mailbox('inbox');
        // Display success message to user
        displayMessage(result['message'], 'alert-success');
      }
      else {
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

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function displayMessage(message, Class) {
  // Get message element
  messageElement = document.querySelector('#message');
  // Update message element html value
  messageElement.innerHTML = message

  // Add alert classes and style it
  messageElement.className = `alert ${Class}`;
  messageElement.style.display = 'block';

  // If hide button is clicked, delete the post
  if (Class === 'alert-success') {
    messageElement.style.animationPlayState = 'running';
    messageElement.addEventListener('animationend', () => {
      messageElement.remove();
    });
  }
  console.log('dispalyMessage() function is called!');
}