const plugin = (name) => window.Capacitor?.Plugins?.[name];

const consumeNativeAuthUrl = async (url) => {
  if (!url?.startsWith("fearsocial://auth")) return false;
  const parsed = new URL(url);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const token = hashParams.get("token") || parsed.searchParams.get("token");
  const message = parsed.searchParams.get("message");
  if (token) {
    localStorage.setItem("fear-session-token", token);
    await plugin("Browser")?.close?.().catch?.(() => {});
    window.location.hash = "app";
    window.dispatchEvent(new CustomEvent("fear:native-auth", { detail: { ok: true } }));
    return true;
  }
  await plugin("Browser")?.close?.().catch?.(() => {});
  window.location.hash = `login?oauth=error&message=${encodeURIComponent(message || "Sign-in did not finish. Please try again.")}`;
  window.dispatchEvent(new CustomEvent("fear:native-auth", { detail: { ok: false } }));
  return true;
};

export const initNativeRuntime = async () => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return () => {};

  const platform = capacitor.getPlatform?.() || "native";
  document.documentElement.classList.add("native-app", `native-${platform}`);
  document.body.classList.add("native-app-body");

  await plugin("StatusBar")?.setOverlaysWebView?.({ overlay: false }).catch?.(() => {});
  await plugin("StatusBar")?.setStyle?.({ style: "LIGHT" }).catch?.(() => {});
  await plugin("Keyboard")?.setResizeMode?.({ mode: "native" }).catch?.(() => {});

  const removers = [];
  const add = async (target, eventName, listener) => {
    const handle = await target?.addListener?.(eventName, listener);
    if (handle?.remove) removers.push(() => handle.remove());
  };

  await add(plugin("App"), "appUrlOpen", ({ url }) => consumeNativeAuthUrl(url));
  await add(plugin("App"), "appStateChange", ({ isActive }) => {
    document.documentElement.classList.toggle("native-app-inactive", !isActive);
  });
  await add(plugin("Keyboard"), "keyboardWillShow", () => document.documentElement.classList.add("native-keyboard-open"));
  await add(plugin("Keyboard"), "keyboardWillHide", () => document.documentElement.classList.remove("native-keyboard-open"));

  const setOnline = () => document.documentElement.classList.toggle("native-offline", !navigator.onLine);
  setOnline();
  window.addEventListener("online", setOnline);
  window.addEventListener("offline", setOnline);

  plugin("App")?.getLaunchUrl?.().then(({ url }) => consumeNativeAuthUrl(url)).catch?.(() => {});

  return () => {
    removers.forEach((remove) => remove());
    window.removeEventListener("online", setOnline);
    window.removeEventListener("offline", setOnline);
  };
};
