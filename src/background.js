const BASE_URL = "https://medium.com";

/**
 * Base request helper, stripping JSON hijacking characters.
 * @param {string} url
 */
const request = (url) => {
  const headers = {
    headers: { accept: "application/json" },
  };
  return fetch(`${BASE_URL}${url}`, headers)
    .then((res) => res.text())
    .then((text) => JSON.parse(text.slice(16)).payload);
};

/**
 * Fetch a list of medium post metadata.
 */
const getPosts = () => request(`/me/stats?limit=100`).then((res) => res.value);

/**
 * Fetch granular stats for a single post.
 * @param {string} postId
 */
const getStatsForPost = (postId) =>
  request(`/stats/${postId}/0/${Date.now()}`).then((res) => res.value);

/**
 * Generating normalized stats for top 100 posts.
 */
const generateStats = () =>
  getPosts()
    .then(normalizePostStats)
    .then(sortPostsByViews)
    .then(appendAdditionalStats);

/**
 * Stats are ordered from old to new.
 * Find the first index less than the given timestamp.
 * If there is no lesser index, return 0.
 * @param {Array<PostStat>} stats
 * @param {number} timestamp
 */
const findStartingIndex = (stats, timestamp) => {
  for (let i = 0; i < stats.length; i++) {
    if (stats[i].collectedAt > timestamp) {
      return Math.max(i - 1, 0);
    }
  }
  return stats.length;
};

/**
 * Aggregate 24hr stats for all posts.
 * @param {Array<PostStat>} stats
 */
const aggregateDailyStats = (stats) => {
  const index = findStartingIndex(stats, Date.now() - 86400000);
  return stats.slice(index).reduce(
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
};

/**
 * Aggregate stats for all posts.
 * @param {Array<Post>} posts
 */
const normalizePostStats = (posts) =>
  Promise.all(
    posts.map((post) =>
      getStatsForPost(post.postId).then((stats) => ({
        postId: post.postId,
        title: post.title,
        ...aggregateDailyStats(stats),
      }))
    )
  );

/**
 * Sort the aggregated posts by number of views.
 * @param {Array<AggregatedPostStat>} posts
 */
const sortPostsByViews = (posts) =>
  posts.sort((a, b) => {
    const viewsA = a.views;
    const viewsB = b.views;
    if (viewsA < viewsB) {
      return 1;
    }
    if (viewsA > viewsB) {
      return -1;
    }
    return 0;
  });

/**
 * Add additional stats to the response object before returning.
 * In this case we're adding total views.
 * @param {Array<AggregatedPostStat>} posts
 */
const appendAdditionalStats = (posts) => ({
  posts,
  total: posts.reduce((a, c) => (a += c.views), 0),
});

/**
 * event listener for responding to chrome cross-app messages
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type } = request;

  switch (type) {
    case "GET_POST_STATS":
      generateStats().then(sendResponse);
    default:
      return true;
  }
});
