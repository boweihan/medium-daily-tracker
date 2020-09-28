// constants
const BASE_URL = "https://medium.com";

// event handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type } = request;

  switch (type) {
    case "GET_POST_STATS":
      getPostStats().then((res) => {
        sendResponse(processPostStats(res));
      });
    default:
      return true;
  }
});

// request helpers
const request = (url) =>
  fetch(url, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
    .then((res) => res.text())
    .then((text) => JSON.parse(text.slice(16)).payload);

const getPosts = () =>
  request(`${BASE_URL}/me/stats?limit=1000`).then((res) => {
    const { value } = res;
    return value;
  });

const getStatsForPost = (postId) =>
  request(`${BASE_URL}/stats/${postId}/0/${Date.now()}`).then((res) => res);

const getPostStats = () =>
  getPosts().then((posts) =>
    Promise.all(
      posts.map((post) =>
        getStatsForPost(post.postId).then((stats) =>
          aggregatePostStats(stats.value, post)
        )
      )
    )
  );

// aggregation helpers
const findPostIndex = (stats, timestamp) => {
  for (let i = 0; i < stats.length; i++) {
    if (stats[i].collectedAt > timestamp) {
      return Math.max(i - 1, 0);
    }
  }
  return stats.length;
};

const calculateStats = (stats, index) =>
  stats.slice(index).reduce(
    (a, c) => {
      a.views += c.views;
      a.upvotes += c.upvotes;
      a.reads += c.reads;
      a.claps += c.claps;
      return a;
    },
    {
      views: 0,
      upvotes: 0,
      reads: 0,
      claps: 0,
    }
  );

const aggregatePostStats = (stats, post) => {
  const dayInMs = 86400000;
  const now = Date.now();
  const day = now - dayInMs;
  const week = now - dayInMs * 7;
  const month = now - dayInMs * 7 * 4;

  return {
    ...post,
    stats: calculateStats(stats, findPostIndex(stats, day)),
  };
};

const processPostStats = (posts) => {
  posts.sort((a, b) => {
    const viewsA = a.stats.views;
    const viewsB = b.stats.views;
    if (viewsA < viewsB) {
      return 1;
    }
    if (viewsA > viewsB) {
      return -1;
    }
    return 0;
  });

  return {
    posts,
    total: posts.reduce((a, c) => (a += c.stats.views), 0),
  };
};
