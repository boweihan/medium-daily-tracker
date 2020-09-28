// dynamic elements
const $version = document.querySelector("#version");
const $posts = document.querySelector("#posts");
const $spinner = document.querySelector("#spinner");

// set extension version to be manifest version
const setVersion = () => {
  $version.textContent = "v" + chrome.runtime.getManifest().version;
};

const createListTitle = (post) => {
  const title = document.createElement("p");
  const textNode = document.createTextNode(post.title);
  title.appendChild(textNode);
  return title;
};

const createParagraphText = (text) => {
  const paragraph = document.createElement("p");
  const textNode = document.createTextNode(text);
  paragraph.appendChild(textNode);
  return paragraph;
};

const createListMetrics = (post) => {
  const listMetric = document.createElement("div");
  listMetric.appendChild(createParagraphText("views: " + post.stats.views));
  listMetric.appendChild(createParagraphText("reads: " + post.stats.reads));
  listMetric.appendChild(createParagraphText("upvotes: " + post.stats.upvotes));
  listMetric.appendChild(createParagraphText("claps: " + post.stats.claps));
  return listMetric;
};

const createListItem = (post, total) => {
  const listItem = document.createElement("li");
  const container = document.createElement("div");
  container.appendChild(createListTitle(post));
  container.appendChild(createListMetrics(post));
  listItem.appendChild(container);
  listItem.appendChild(createListBar(post, total));

  return listItem;
};

const createListBar = (post, total) => {
  const bar = document.createElement("span");
  const mask = document.createElement("span");
  bar.classList.add("bar");
  mask.classList.add("mask");
  mask.style.left = `${Math.round((post.stats.views / total) * 100)}%`;
  mask.style.right = 0;
  bar.appendChild(mask);
  return bar;
};

// fetch post statistics and display
const appendPostListItems = (posts, total) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    fragment.appendChild(createListItem(post, total));
  }
  $posts.appendChild(fragment);
};

const setPostStats = () => {
  chrome.runtime.sendMessage({ type: "GET_POST_STATS" }, {}, (res) => {
    const { posts, total } = res;
    appendPostListItems(posts, total);
    $spinner.style.display = "none";
  });
};

// initialization
setVersion();
setPostStats();
