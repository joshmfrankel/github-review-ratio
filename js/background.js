'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });
});

chrome.browserAction.onClicked.addListener(function() {
  let daysInPast = 21;
  let today = new Date();
  let mergedDateFilter = new Date(today.setDate(today.getDate() - daysInPast)).toISOString().slice(0, 10);
  const username = '';
  const accessToken = '';
  let totalAuthoredPullRequests = 0;
  let totalReviewedPullRequests = 0;

  // TODO
  // Prevent this promise if
  // * Last check was performed less than 1 hour ago
  // * Use the Chrome.alarm api to do a minute-by-minute check of the last time
  //   requested
  // * Upon greater than 1 hour ago, go ahead with the promise below and set a
  //   chrome storage value to the time updated at. This allows us to check in the
  //   minute-by-minute step above
  Promise.all([
    fetch(`https://api.github.com/search/issues?q=+type:pr+repo:username/repo+author:${username}+is:merged+review:approved+merged:>=${mergedDateFilter}&sort=created&order=asc&access_token=${accessToken}`).then(response => response.json()),
    fetch(`https://api.github.com/search/issues?q=+type:pr+repo:username/repo+is:merged+review:approved+merged:>=${mergedDateFilter}+reviewed-by:${username}&sort=created&order=asc&access_token=${accessToken}`).then(response => response.json())
  ]).then(responses => {
    totalAuthoredPullRequests = responses[0].total_count;
    totalReviewedPullRequests = responses[1].items.filter(
      item => item.user.login !== username,
    ).length;
    const reviewRatio = (
      totalReviewedPullRequests / totalAuthoredPullRequests
    ).toFixed(1);

    // Some goodies if debug mode is enabled
    chrome.storage.sync.get('debugMode', (result) => {
      if (result['debugMode'] === true) {
        console.log(responses[0]);
        console.log(responses[1]);
        console.log(responses[1].items.filter(item => item.user.login !== username));
        console.log(totalReviewedPullRequests);
      }
    });

    chrome.browserAction.setBadgeBackgroundColor({ color: "#000" });

    // If ratio is lower than normal then set background color to red
    if (reviewRatio < 0.85) {
      chrome.browserAction.setBadgeBackgroundColor({ color: "#f44242" });
    }

    chrome.browserAction.setBadgeText({ text: reviewRatio.toString() });
    chrome.browserAction.setTitle({ title: `Your review ration is: ${reviewRatio.toString()}`})
  });
});
