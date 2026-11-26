// 영문 이력서 PDF 생성: scripts/resume/resume-en.html → public/assets/resume/GeonhoKim_Resume_EN.pdf
// 사용: node scripts/build-resume-en.mjs  (내용 수정은 HTML 템플릿에서)
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const channel = process.platform === "win32" ? "msedge" : "chrome";
const browser = await chromium.launch({ channel });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve("scripts/resume/resume-en.html")).href, { waitUntil: "load" });
await page.pdf({ path: "public/assets/resume/GeonhoKim_Resume_EN.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("public/assets/resume/GeonhoKim_Resume_EN.pdf");
