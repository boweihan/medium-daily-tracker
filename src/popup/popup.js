// dynamic elements
const $version = document.querySelector("#version");
const $posts = document.querySelector("#posts");

// set extension version to be manifest version
const setVersion = () => {
  $version.textContent = "v" + chrome.runtime.getManifest().version;
};

// fetch post statistics and display
const appendPostListItems = (posts) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const listElem = document.createElement("li");
    const listTextNode = document.createTextNode(post.postId);
    listElem.appendChild(listTextNode);
    listElem.className = "post-item";
    fragment.appendChild(listElem);
  }
  $posts.appendChild(fragment);
};

const setPostStats = () => {
  chrome.runtime.sendMessage({ type: "GET_POST_STATS" }, {}, (res) => {
    const { posts, total } = res;
    appendPostListItems(posts);
  });
};

// initialization
setVersion();
setPostStats();
