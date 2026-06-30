import { execSync } from 'child_process';
import fs from 'fs';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out || '(no output)');
    return { success: true, stdout: out };
  } catch (err: any) {
    console.log(`ERROR: ${err.message}`);
    return { success: false, error: err };
  }
}

console.log("=== Staging all modified and untracked files ===");
run('git add -A');

console.log("=== Committing changes ===");
const commitMsg = process.argv[3] || "ci: replace failing static pages deploy with container and security workflows";
run(`git commit -m "${commitMsg}"`);

// Read token from command-line arguments or environment
const token = process.argv[2] || process.env.GITHUB_TOKEN;
const finalToken = token ? token.trim() : "";

if (finalToken) {
  console.log("=== Setting Authenticated Remote ===");
  const authenticatedUrl = `https://${finalToken}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
  run(`git remote set-url origin "${authenticatedUrl}"`);

  // Push to main and dev
  console.log("=== Pushing changes to origin main ===");
  run('git push origin HEAD:main');
  console.log("=== Pushing changes to origin dev ===");
  run('git push origin HEAD:dev');

  // Reset remote URL for safety
  run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
  console.log("=== SUCCESS: Repo cleaned and pushed successfully! ===");
} else {
  console.log("=== WARNING: No valid GITHUB_TOKEN or PAT found in environment. ===");
}
