chrome.runtime.onInstalled.addListener(function () {
  console.log("onInstalled");
});

const API_URL = "https://medium.com";

function request(url) {
  return fetch(url, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
    .then((res) => res.text())
    .then((text) => JSON.parse(text.slice(16)).payload);
}

function getTotals(url, payload) {
  let finalUrl = `${API_URL}${url}?limit=1000`;
  if (!payload) {
    return request(finalUrl).then((res) => getTotals(url, res));
  }
  const { value, paging } = payload;
  if (
    payload &&
    paging &&
    paging.next &&
    paging.next.to &&
    value &&
    value.length
  ) {
    finalUrl += `&to=${paging.next.to}`;
    return request(finalUrl).then((res) => {
      payload.value = [...payload.value, ...res.value];
      payload.paging = res.paging;
      return getTotals(url, payload);
    });
  } else {
    console.log(payload);
    return Promise.resolve(payload);
  }
}

console.log(getTotals("/me/stats"));
