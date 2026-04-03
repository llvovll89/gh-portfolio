import { execSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => {
    try {
        const input = JSON.parse(data);
        const filePath = input?.tool_input?.file_path;
        if (!filePath || !/\.(ts|tsx)$/.test(filePath)) return;

        const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
        execSync(`npx eslint --fix "${filePath}"`, {
            cwd: projectRoot,
            stdio: 'inherit',
        });
    } catch {
        // 무시 — 린트 실패가 Claude 작업을 막으면 안 됨
    }
});
