import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const dirs = ["projects", "kimgeonho", "icons/png"];
const output = "public/assets/optimized";
await fs.mkdir(output, { recursive: true });
const manifest = {};
let before = 0, after = 0;
for (const dir of dirs) {
    const base = "public/assets/images/" + dir;
    for (const file of await fs.readdir(base)) {
        if (!file.endsWith(".png")) continue;
        const input = path.join(base, file);
        const raw = await fs.readFile(input);
        const metadata = await sharp(raw).metadata();
        const maxWidth = Math.min(metadata.width, dir === "kimgeonho" ? 320 : 1600);
        const widths = [...new Set([320, 640, 960, maxWidth].filter(width => width <= maxWidth))].sort((a,b) => a-b);
        const hash = createHash("sha256").update(raw).digest("hex").slice(0, 10);
        const name = path.basename(file, ".png");
        const sources = [];
        let largestSize = 0;
        for (const width of widths) {
            const filename = name + "-" + hash + "-" + width + ".webp";
            const buffer = await sharp(raw).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toBuffer();
            await fs.writeFile(path.join(output, filename), buffer);
            sources.push({ src: "/assets/optimized/" + filename, width });
            largestSize = buffer.length;
        }
        before += raw.length;
        after += largestSize;
        manifest["/assets/images/" + dir + "/" + file] = {
            src: sources.at(-1).src,
            srcSet: sources.map(item => item.src + " " + item.width + "w").join(", "),
            width: metadata.width,
            height: metadata.height,
        };
    }
}
await fs.writeFile("src/generated/images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes: before, optimizedLargestBytes: after, savedPercent: Math.round((1-after/before)*100) }));
