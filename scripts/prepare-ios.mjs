import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const appDir = resolve(root, "ios/App/App");
const plistPath = resolve(appDir, "Info.plist");
const sourceManifest = resolve(root, "native/ios/PrivacyInfo.xcprivacy");
const sourceEntitlements = resolve(root, "native/ios/App.entitlements");
const projectPath = resolve(root, "ios/App/App.xcodeproj/project.pbxproj");

if (!existsSync(appDir) || !existsSync(plistPath)) {
  console.error("The iOS project does not exist yet. Install full Xcode, run npm install, then run npm run ios:add.");
  process.exit(1);
}

await mkdir(appDir, { recursive: true });
await cp(sourceManifest, resolve(appDir, "PrivacyInfo.xcprivacy"));
await cp(sourceEntitlements, resolve(appDir, "App.entitlements"));

let plist = await readFile(plistPath, "utf8");
const entries = [
  ["NSCameraUsageDescription", "fear.social uses the camera when you choose to capture a profile photo or create a photo or video post."],
  ["NSMicrophoneUsageDescription", "fear.social uses the microphone when you choose to record a video post."],
  ["NSPhotoLibraryUsageDescription", "fear.social accesses photos and videos only when you choose media for your profile or a post."],
  ["NSPhotoLibraryAddUsageDescription", "fear.social can save media to your library only when you explicitly choose to save it."],
];
for (const [key, value] of entries) {
  if (!plist.includes(`<key>${key}</key>`)) {
    plist = plist.replace("</dict>\n</plist>", `  <key>${key}</key>\n  <string>${value}</string>\n</dict>\n</plist>`);
  }
}
if (!plist.includes("<string>fearsocial</string>")) {
  const deepLink = `  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLName</key>\n      <string>social.fear.app.auth</string>\n      <key>CFBundleURLSchemes</key>\n      <array><string>fearsocial</string></array>\n    </dict>\n  </array>\n`;
  plist = plist.replace("</dict>\n</plist>", `${deepLink}</dict>\n</plist>`);
}
await writeFile(plistPath, plist);

if (existsSync(projectPath)) {
  let project = await readFile(projectPath, "utf8");
  if (!project.includes("CODE_SIGN_ENTITLEMENTS = App/App.entitlements;")) {
    project = project.replace(
      /(PRODUCT_BUNDLE_IDENTIFIER = social\.fear\.app;)/g,
      "CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\t$1"
    );
    await writeFile(projectPath, project);
  }
}

console.log("iOS privacy manifest, Sign in with Apple entitlement, permission descriptions, and OAuth deep link are ready.");
