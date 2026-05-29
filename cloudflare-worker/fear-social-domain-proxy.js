export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const pagesUrl = new URL(incomingUrl.pathname + incomingUrl.search, "https://fear-social.pages.dev");

    const proxyRequest = new Request(pagesUrl, request);
    proxyRequest.headers.set("Host", pagesUrl.hostname);

    const response = await fetch(proxyRequest);
    const headers = new Headers(response.headers);
    headers.delete("x-vercel-id");
    headers.delete("x-vercel-cache");
    headers.delete("x-vercel-error");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
