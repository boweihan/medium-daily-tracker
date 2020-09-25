// constants
const BASE_URL = "https://medium.com";

// event handlers
chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type } = request;

  switch (type) {
    case "GET_POST_STATS":
      getPostStats().then((res) => {
        console.log(res);
        sendResponse(res);
      });
    default:
      return true;
  }
});

// helpers
const request = (url) =>
  fetch(url, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
    .then((res) => res.text())
    .then((text) => JSON.parse(text.slice(16)).payload);

const getPostIds = () =>
  request(`${BASE_URL}/me/stats?limit=1000`).then((res) => {
    const { value } = res;
    const postIds = value.map((post) => post.postId);
    return postIds;
  });

const getStatsForPost = (postId) =>
  request(`${BASE_URL}/stats/${postId}/0/${Date.now()}`).then((res) => res);

const getPostStats = () =>
  getPostIds().then((postIds) =>
    Promise.all(postIds.map((postId) => getStatsForPost(postId)))
  );
