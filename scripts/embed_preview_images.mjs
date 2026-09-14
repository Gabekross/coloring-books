import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const replacements = {
  "__PREVIEW_PRINCESS_DANCING__": "princess-dancing.jpg",
  "__PREVIEW_PRINCESS_BUNNY__": "princess-bunny.jpg",
  "__PREVIEW_PRINCESS_BUTTERFLIES__": "princess-butterflies.jpg",
  "__PREVIEW_PRINCESS_BALLOONS__": "princess-balloons.jpg",
};

let source = readFileSync("worker/index.js", "utf8");

for (const [placeholder, filename] of Object.entries(replacements)) {
  const image = readFileSync(path.join("worker", "sample-previews", filename));
  source = source.replace(placeholder, image.toString("base64"));
}

writeFileSync("worker/index.js", source);
