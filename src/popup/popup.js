/********* selectors **********/
const $body = document.querySelector("#body");
const $spinner = document.querySelector(".spinner-container");

/******** DOM helpers *********/
const createText = (text) => {
  const $text = document.createElement("p");
  const $textNode = document.createTextNode(text);
  $text.appendChild($textNode);
  return $text;
};

const createListMetrics = (post) => {
  const $metric = document.createElement("div");
  $metric.appendChild(createText(`views: ${post.views}`));
  $metric.appendChild(createText(`reads: ${post.reads}`));
  $metric.appendChild(createText(`upvotes: ${post.upvotes}`));
  $metric.appendChild(createText(`claps: ${post.claps}`));
  return $metric;
};

const createListBar = (post, total) => {
  const $bar = document.createElement("span");
  const $mask = document.createElement("span");
  $mask.style.left = `${Math.round((post.views / total) * 100)}%`;
  $bar.appendChild($mask);
  return $bar;
};

const createListItem = (post, total) => {
  const $item = document.createElement("li");
  $item.appendChild(createText(post.title));
  $item.appendChild(createListMetrics(post));
  $item.appendChild(createListBar(post, total));
  return $item;
};

/**
 * Render a list of DOM elements based on normalized data
 * @param {*} data
 */
const render = (data) => {
  const { posts, total } = data;
  const $fragment = document.createDocumentFragment();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    $fragment.appendChild(createListItem(post, total));
  }
  $body.appendChild($fragment);
};

/**
 * Fetch normalized data from background script
 */
const initialize = () => {
  chrome.runtime.sendMessage({ type: "GET_POST_STATS" }, {}, (data) => {
    render(data);
    $spinner.style.display = "none";
  });
};

initialize();
