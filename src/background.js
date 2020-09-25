chrome.runtime.onInstalled.addListener(function () {
  console.log("onInstalled");
});

const BASE_URL = "https://medium.com";

function request(url) {
  return fetch(url, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
    .then((res) => res.text())
    .then((text) => JSON.parse(text.slice(16)).payload);
}

function getPostIds() {
  return request(`${BASE_URL}/me/stats?limit=1000`).then((res) => {
    const { value } = res;
    const postIds = value.map((post) => post.postId);
    console.log(postIds);
    return postIds;
  });
}

function getStatsForPost(postId) {
  return request(`${BASE_URL}/stats/${postId}/0/${Date.now()}`).then((res) => {
    console.log(res);
    return res;
  });
}

getPostIds();
getStatsForPost("1a43edb4c38e");
getStatsForPost("624efd5a224");
