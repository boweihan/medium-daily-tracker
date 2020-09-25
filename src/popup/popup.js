// dynamic elements
const $version = document.querySelector("#version");
const $posts = document.querySelector("#posts");

// set extension version to be manifest version
const setVersion = () => {
  $version.textContent = "v" + chrome.runtime.getManifest().version;
};

// fetch post statistics and display
const setPostStats = () => {
  chrome.runtime.sendMessage({ type: "GET_POST_STATS" }, {}, (res) => {
    $posts.textContent = res;
  });
};

// initialization
setVersion();
setPostStats();
