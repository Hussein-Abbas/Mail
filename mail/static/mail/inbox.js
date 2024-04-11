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
    return false;
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load data and display it
  load_data(mailbox);
}

// Display message to user
function displayMessage(message, Class) {
  // Get message element
  messageElement = document.querySelector('#message');

  // Update message element html value
  messageElement.innerHTML = message;

  // Add alert classes and style it
  messageElement.className = `alert ${Class}`;
  messageElement.style.display = 'block';

  // If message class is success, remove message after display it
  if (Class !== 'alert-danger') {
    messageElement.style.animationPlayState = 'running';
    messageElement.addEventListener('animationend', () => {
      messageElement.style.display = 'none';
    });
  }
}

// Load email view with its id
function load_email(id) {
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Make GET request to get the email by its id
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(data => {
    // Set all values for HTML elements
    document.querySelector('#from').innerHTML = data['sender'];
    document.querySelector('#to').innerHTML = data['recipients'];
    document.querySelector('#subject').innerHTML = data['subject'];
    document.querySelector('#timestamp').innerHTML = data['timestamp'];
    document.querySelector('#body').innerHTML = data['body'];
  })
  // Mark as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
}

// Load data for each mailbox
function load_data(mailbox) {
  // Make GET request for mailbox data.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Iterate on each email
    emails.forEach(function(email) {
      
      // Create all divs we need
      let Container = document.createElement('div');
      let box = document.createElement('div');
      let sender = document.createElement('div');
      let subject = document.createElement('div');
      let timestamp = document.createElement('div');

      // Set correct classes
      Container.className = 'Container';
      box.classList.add('box');
      sender.className = 'sender';
      subject.className = 'subject';
      timestamp.className = 'timestamp';

      // Set emails id to Container
      Container.id = email['id'];

      // Style emails as read or not
      if (email['read']) {
        Container.classList.add('readed');
      }
      else {
        Container.classList.add('unreaded');
      }

      // Set inner html values
      sender.innerHTML = email['sender'];
      subject.innerHTML = email['subject'];
      timestamp.innerHTML = email['timestamp'];

      // Add parts of email to the box
      box.append(sender);
      box.append(subject);
      box.append(timestamp);

      // Add box to Container
      Container.append(box);

      // Get user Email
      userEmail = document.querySelector('h2').innerHTML;

      // If the email isn't from the user, add archive button
      if (userEmail !== email['sender']) {
        // Add archive button to Container
        Container.append(createArchiveButton(email));
      }


      // Add the box to email view
      document.querySelector('#emails-view').append(Container);

      // Add click event listener for the email
      box.addEventListener('click', function() {
        // Load the email by its id
        load_email(box.parentElement.id);
      });
    })
  })
}

// Create archive button
function createArchiveButton(email) {
  // Cretae archive button
  let archiveButton = document.createElement('button');

  // Style archive button
  archiveButton.className = 'btn btn-sm btn-outline-secondary';

  if (email['archived']) {
    archiveButton.innerHTML = 'unarchive';
  }
  else {
    archiveButton.innerHTML = 'archive';
  }

  archiveButton.addEventListener('click', function() {
    archivingEmail(email);
  });

  // Return archive button
  return archiveButton;
}

// Arhive/Unarchive email
function archivingEmail(email){
  if (email['archived']) {    
    fetch(`/emails/${email['id']}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(response => {
      // Display message to user
      displayMessage("Unarchived", 'alert-secondary');

      // Redircet user to inbox view
      load_mailbox('inbox');
    })

  }
  else {
    fetch(`/emails/${email['id']}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(response => {
      // Display message to user
      displayMessage("Archived", 'alert-secondary');

      // Redirect user to archive view
      load_mailbox('inbox');    
    })

  }
}