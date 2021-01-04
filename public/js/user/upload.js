const fileSubmitForm = document.querySelector('#file-submit-form__upload');
const fileInput = document.querySelector('#file-input');
const dropArea = document.querySelector('#file-submit-form__upload #drop-area');
const uploadData = {}; // final object to be sent to server when user clicks the upload button
uploadData['entries'] = [];

// Get file with "Select file" button
fileInput.addEventListener('change', (e) => {
  // Hide actions buttons/error messages if they exist
  document.querySelector('#upload-actions').classList.remove('d-none');
  document.querySelector('#upload-actions').classList.add('d-none');
  document.querySelector('#file-submit-msg').style.display = '';
  document.querySelector('#file-submit-msg').innerText = '';

  const file = fileInput.files[0]; // Single file selection
  if (file) {
    processFile(file);
  }
});

// Get file with drag and drop functionality
dropArea.addEventListener(
  'dragenter',
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.backgroundColor = '#d0d5d6'; // Darken
  },
  false
);

dropArea.addEventListener(
  'dragover',
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.backgroundColor = '#d0d5d6'; // Darken
  },
  false
);

dropArea.addEventListener(
  'dragleave',
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.backgroundColor = '#ecf0f1'; // Reset color
  },
  false
);

dropArea.addEventListener(
  'drop',
  (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Hide actions buttons/error messages if they exist
    document.querySelector('#upload-actions').classList.remove('d-none');
    document.querySelector('#upload-actions').classList.add('d-none');

    dropArea.style.backgroundColor = '#ecf0f1'; // Reset color
    const dataTransfer = e.dataTransfer;
    const file = dataTransfer.files[0];
    processFile(file);
  },
  false
);

const processFile = (file) => {
  const fileReader = new FileReader(); // from File API
  fileReader.readAsText(file);

  // Get file contents
  fileReader.addEventListener('loadend', (e) => {
    // Show uploa action buttons
    document.querySelector('#upload-actions').classList.remove('d-none');

    let fileContent = e.target.result;
    let har = JSON.parse(fileContent); // original har file
    let entries = har.log.entries;

    const fileSubmitMsg = document.querySelector('#file-submit-msg');
    fileSubmitMsg.style.display = 'block';
    fileSubmitMsg.innerText = `${entries.length} entries found. Click below to upload or download in JSON format.`;

    for (const entry of entries) {
      processEntry(entry);
    }

    // Upload button event handler
    // TODO: Refactor with async-await
    document.querySelector('#upload-btn').addEventListener('click', (e) => {
      e.preventDefault();
      const spinner = document.querySelector('#spinner');
      document.querySelector('#upload-actions').classList.add('d-none');
      fileSubmitMsg.style.display = 'none';
      spinner.classList.remove('d-none');
      fetch(
        'https://api.ipdata.co/?api-key=1636218196f0081bda53161e458d69f131b9cac17a2396c1e6af378e'
      )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          uploadData['userISP'] = data.asn.name;
          uploadData['userCity'] = data.city;
          uploadData['userLat'] = data.latitude;
          uploadData['userLon'] = data.longitude;

          fetch(`http://${location.host}/upload/upload-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              console.log(data);
              spinner.classList.add('d-none');
              if (data.uploadSuccess) {
                window.location.replace(
                  `http://${location.host}/upload?success=1`
                );
              }
            });
        });
    });

    // Download button event handler
    // TODO: Refactor with async-await
    document.querySelector('#download-btn').addEventListener('click', (e) => {
      e.preventDefault();

      const spinner = document.querySelector('#spinner');
      document.querySelector('#upload-actions').classList.add('d-none');
      fileSubmitMsg.style.display = 'none';
      spinner.classList.remove('d-none');
      // Delete sensitive fields
      let entries = har.log.entries; // entries of oringinal har file
      for (let entry of entries) {
        // Here we want to remove certain fields
        // from the original har file
        if (entry.request.cookies) {
          entry.request.cookies = []; // delete request cookies
        }
        if (entry.request.queryString) {
          entry.request.queryString = []; // delete query string values
        }
        if (entry.request.postData) {
          entry.request.postData = {}; // delete POST request data
        }
        if (entry.response.cookies) {
          entry.response.cookies = []; // delete response cookies
        }
      }

      console.log(entries);
      fetch(`http://${location.host}/upload/download-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(har), // send har as text to be parsed as JSON on the server
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          spinner.classList.add('d-none');
          window.location.href = `http://${location.host}/upload?fileName=${data.fileName}`;
        });
    });
  });
};

const processEntry = (entry) => {
  const entryData = {};

  // entries table
  let serverIPAddress = entry.serverIPAddress;
  serverIPAddress = serverIPAddress.replace(/[\[\]]/g, '');
  entryData['serverIPAddress'] = serverIPAddress;
  entryData['startedDateTime'] = entry.startedDateTime;
  entryData['wait'] = entry.timings.wait;

  // requests table
  entryData['requestMethod'] = entry.request.method;
  entryData['requestUrl'] = getDomainName(entry.request.url);

  for (const header of entry.request.headers) {
    if (header.name === 'content-type' || header.name === 'Content-Type') {
      header.value = header.value.replace(/ /g, '');
      header.value = header.value.replace(/;/g, ',');
      entryData['requestContentType'] = header.value;
    }
    if (header.name === 'cache-control' || header.name === 'Cache-Control') {
      header.value = header.value.replace(/ /g, '');
      header.value = header.value.replace(/;/g, ',');
      entryData['requestCacheControl'] = header.value;
    }
    if (header.name === 'pragma' || header.name === 'Pragma') {
      entryData['requestPragma'] = header.value;
    }
    if (header.name === 'host' || header.name === 'Host') {
      entryData['requestHost'] = header.value;
    }
  }

  // responses table
  entryData['responseStatus'] = entry.response.status;
  entryData['responseStatusText'] = entry.response.statusText;
  for (const header of entry.response.headers) {
    if (header.name === 'content-type' || header.name === 'Content-Type') {
      header.value = header.value.replace(/ /g, '');
      header.value = header.value.replace(/;/g, ',');
      entryData['responseContentType'] = header.value;
    }
    if (header.name === 'cache-control' || header.name === 'Cache-Control') {
      header.value = header.value.replace(/ /g, '');
      header.value = header.value.replace(/;/g, ',');
      entryData['responseCacheControl'] = header.value;
    }
    if (header.name === 'pragma' || header.name === 'Pragma') {
      entryData['responsePragma'] = header.value;
    }
    if (header.name === 'expires' || header.name === 'Expires') {
      // Convert date to UTC
      entryData['responseExpires'] = header.value;
    }
    if (header.name === 'age' || header.name === 'Age') {
      entryData['responseAge'] = header.value;
    }
    if (header.name === 'last-modified' || header.name === 'Last-Modified') {
      // Convert date to UTC
      entryData['responseLastModified'] = header.value;
    }
  }

  uploadData.entries.push(entryData);
};

const getDomainName = (url) => {
  let domain = new URL(url);
  domain = domain.hostname;

  return domain;
};
