import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("public/icon.svg");
const sizes = [
  [16, "favicon-16.png"],
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
  [512, "icon-512.png"],
];

for (const [size, name] of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/${name}`);
}

console.log("Generated favicon assets in public/");
