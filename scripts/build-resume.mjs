// 이력서 PDF 생성: scripts/resume/resume-{ko,en}.html → public/assets/resume/
// 사용: node scripts/build-resume.mjs  (내용 수정은 HTML 템플릿에서, 1페이지 A4 유지)
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const targets = [
    { template: "scripts/resume/resume-ko.html", output: "public/assets/resume/김건호_이력서.pdf" },
    { template: "scripts/resume/resume-en.html", output: "public/assets/resume/GeonhoKim_Resume_EN.pdf" },
];

const channel = process.platform === "win32" ? "msedge" : "chrome";
const browser = await chromium.launch({ channel });
const page = await browser.newPage();
for (const { template, output } of targets) {
    await page.goto(pathToFileURL(resolve(template)).href, { waitUntil: "load" });
    // 웹폰트·사진 로드가 끝난 뒤 인쇄
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: output, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(output);
}
await browser.close();
