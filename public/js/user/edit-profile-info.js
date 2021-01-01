const editProfileInfoForm = document.querySelector('#edit-profile-info-form');
const alertSuccess = document.querySelector('#alert-success');
const firstNameMsg = document.querySelector('#first-name-msg');
const lastNameMsg = document.querySelector('#last-name-msg');
const usernameMsg = document.querySelector('#username-msg');
const passwordMsg = document.querySelector('#password-msg');
const firstNameSpan = document.querySelector('span#first-name');
const lastNameSpan = document.querySelector('span#last-name');


editProfileInfoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alertSuccess.classList.add('d-none');
  firstNameMsg.classList.add('d-none');
  lastNameMsg.classList.add('d-none');
  usernameMsg.classList.add('d-none');
  passwordMsg.classList.add('d-none');
  // Get form field values
  const userId = document.querySelector('#user-id').value;
  const firstName = document.querySelector('#edit-first-name').value;
  const lastName = document.querySelector('#edit-last-name').value;
  const username = document.querySelector('#edit-username').value;
  const password = document.querySelector('#edit-password').value;

  // Group form field values
  const editedInfo = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: password,
  };

  fetch(`http://${location.host}/profile/edit/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(editedInfo),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      if (data.editSuccess) {
        alertSuccess.classList.toggle('d-none');
        firstNameSpan.innerHTML = data.firstName;
        lastNameSpan.innerHTML = data.lastName;
      } else {
        if (data.firstNameErr) {
          firstNameMsg.innerHTML = data.firstNameErr;
          firstNameMsg.classList.toggle('d-none');
        }
        if (data.lastNameErr) {
          lastNameMsg.innerHTML = data.lastNameErr;
          lastNameMsg.classList.toggle('d-none');
        }
        if (data.usernameErr) {
          usernameMsg.innerHTML = data.usernameErr;
          usernameMsg.classList.toggle('d-none');
        }
        if (data.passwordErr) {
          passwordMsg.innerHTML = data.passwordErr;
          passwordMsg.classList.toggle('d-none');
        }
      }
    });
});
