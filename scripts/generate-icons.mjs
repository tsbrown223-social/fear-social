import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("public/icon.svg");
const socialSvg = readFileSync("public/fear-social-logo-social.svg");
const sizes = [
  [16, "favicon-16.png"],
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
  [512, "icon-512.png"],
];

for (const [size, name] of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/${name}`);
}

await sharp(svg).resize(32, 32).png().toFile("public/favicon.ico");
await sharp(socialSvg).resize(422, 428).png().toFile("public/fear-official-avatar.png");
await sharp(socialSvg).resize(1254, 1254).png().toFile("public/fear-social-logo-social.png");
await sharp(socialSvg).resize(1024, 1024).png().toFile("public/fear-social-logo-social-1024.png");
await sharp(socialSvg).resize(512, 512).png().toFile("public/fear-social-logo-social-512.png");
await sharp(socialSvg).resize(400, 400).png().toFile("public/fear-social-logo-social-linkedin-400.png");

console.log("Generated favicon assets in public/");
