const editProfileInfoForm = document.querySelector('#edit-profile-info-form');
const alertSuccess = document.querySelector('#alert-success');
const firstNameMsg = document.querySelector('#first-name-msg');

editProfileInfoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alertSuccess.classList.add('d-none');
  firstNameMsg.classList.add('d-none');
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
      } else {
        if (data.firstNameErr) {
          
          firstNameMsg.innerHTML = data.firstNameErr;
          firstNameMsg.classList.toggle('d-none');
        }
      }
    });
});
