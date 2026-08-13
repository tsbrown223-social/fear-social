import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const required = [
  "capacitor.config.json",
  "native/ios/PrivacyInfo.xcprivacy",
  "native/ios/App.entitlements",
  "native/ios/Info.plist.additions.xml",
  "public/fear-social-logo-social-1024.png",
  "src/native.js",
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Missing required iOS files:\n${missing.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

execFileSync("plutil", ["-lint", "native/ios/PrivacyInfo.xcprivacy"], { stdio: "inherit" });
execFileSync("plutil", ["-lint", "native/ios/App.entitlements"], { stdio: "inherit" });
const config = JSON.parse(readFileSync("capacitor.config.json", "utf8"));
if (config.appId !== "social.fear.app" || config.webDir !== "dist") {
  console.error("Capacitor appId or webDir is not configured as expected.");
  process.exit(1);
}

let xcodeReady = true;
try {
  execFileSync("xcodebuild", ["-version"], { stdio: "ignore" });
} catch {
  xcodeReady = false;
}
console.log("Web/native configuration: ready");
console.log("Sign in with Apple entitlement: ready");
console.log(`Full Xcode toolchain: ${xcodeReady ? "ready" : "not installed or not selected"}`);
console.log(`Generated iOS project: ${existsSync("ios/App/App.xcodeproj") ? "ready" : "pending npm install + npm run ios:add"}`);
if (!xcodeReady) {
  console.log("Install full Xcode from the Mac App Store, open it once, and select it with xcode-select before creating an archive.");
}
