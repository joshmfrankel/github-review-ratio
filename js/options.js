const defaultDebugMode = false;
const defaultDaysInPast = 21;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(
    {
      'debugMode' : defaultDebugMode,
      'daysInPast': defaultDaysInPast
    }, (result) => {
      document.getElementById('daysInPast').value = result.daysInPast;
      document.getElementById('debugMode').checked = result.debugMode;
  });

  document.getElementById('debugMode').addEventListener('change', (event) => {
    chrome.storage.sync.set({ debugMode: event.target.checked});
  });

  document.getElementById('daysInPast').addEventListener('change', (event) => {
    chrome.storage.sync.set({ daysInPast: clamp(event.target.value, 7, 60) });
  })

  document.getElementById('authorizeGithub').addEventListener('click', event => {
    let username = document.getElementById('githubUsername').value;
    let password = document.getElementById('githubPassword').value;
    let authorization = 'Basic ' + btoa(username + ':' + password);
    let twoFactor = document.getElementById('githubTwoFactor').value;

    if (username && password) {
      fetch('https://api.github.com/authorizations', {
        method: "POST",
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
          'x-github-otp': twoFactor
        },
        body: JSON.stringify({
          scopes: ["repo"],
          note: "Github Review Ratio 2"
        })
      })
      .then(response => response.json())
      .then(response => {
        console.log(response);
        document.getElementById('integrationMessage').textContent = response.message;
      });
    } else {
      document.getElementById('integrationMessage').textContent = 'You must supply both a username and password';
    }
  });
});

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}
