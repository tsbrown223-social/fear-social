export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const pagesUrl = new URL(incomingUrl.pathname + incomingUrl.search, "https://fear-social.pages.dev");

    const proxyRequest = new Request(pagesUrl, request);
    proxyRequest.headers.set("Host", pagesUrl.hostname);

    const response = await fetch(proxyRequest);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};
