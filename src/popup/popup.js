// dynamic elements
const $version = document.querySelector("#version");
const $posts = document.querySelector("#posts");

// set extension version to be manifest version
const setVersion = () => {
  $version.textContent = "v" + chrome.runtime.getManifest().version;
};

// fetch post statistics and display
const appendPostListItems = (posts, total) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const listElem = document.createElement("li");
    const listElemContainer = document.createElement("div");
    const listElemHighlight = document.createElement("span");
    const listElemMask = document.createElement("span");
    const listTitle = document.createElement("p");
    const listMetric = document.createElement("div");
    const listViews = document.createElement("p");
    const listReads = document.createElement("p");
    const listUpvotes = document.createElement("p");
    const listClaps = document.createElement("p");

    const titleTextNode = document.createTextNode(post.title);
    const viewsTextNode = document.createTextNode("views: " + post.stats.views);
    const readsTextNode = document.createTextNode("reads: " + post.stats.reads);
    const upvotesTextNode = document.createTextNode(
      "upvotes: " + post.stats.upvotes
    );
    const clapsTextNode = document.createTextNode("claps: " + post.stats.claps);

    listElemHighlight.classList.add("highlight");
    listElemMask.classList.add("mask");
    listElemMask.style.left = `${Math.round(
      (post.stats.views / total) * 100
    )}%`;
    listElemMask.style.right = 0;

    listViews.appendChild(viewsTextNode);
    listReads.appendChild(readsTextNode);
    listUpvotes.appendChild(upvotesTextNode);
    listClaps.appendChild(clapsTextNode);

    listMetric.appendChild(listViews);
    listMetric.appendChild(listReads);
    listMetric.appendChild(listUpvotes);
    listMetric.appendChild(listClaps);
    listTitle.appendChild(titleTextNode);
    listElemContainer.appendChild(listTitle);
    listElemContainer.appendChild(listMetric);
    listElem.appendChild(listElemContainer);
    listElem.appendChild(listElemHighlight);
    listElem.appendChild(listElemMask);
    fragment.appendChild(listElem);
  }
  $posts.appendChild(fragment);
};

const setPostStats = () => {
  chrome.runtime.sendMessage({ type: "GET_POST_STATS" }, {}, (res) => {
    const { posts, total } = res;
    appendPostListItems(posts, total);
  });
};

// initialization
setVersion();
setPostStats();
