import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out || "(no output)");
    return { success: true, stdout: out };
  } catch (error: any) {
    console.log(`ERROR: ${error.message}`);
    if (error.stdout) console.log("stdout:", error.stdout);
    if (error.stderr) console.log("stderr:", error.stderr);
    return { success: false, error: error };
  }
}

console.log("=== Clean and Re-initialize Corrupt Git Repo ===");

const gitDir = '.git';
if (fs.existsSync(gitDir)) {
  console.log("Deleting corrupted .git directory...");
  fs.rmSync(gitDir, { recursive: true, force: true });
}

run('git init -b main');
run('git config user.name "Salil Apte"');
run('git config user.email "salilapte99@gmail.com"');

const publicUrl = "https://github.com/pallasite99/panipat-1761-shattered-dreams.git";
run(`git remote add origin ${publicUrl}`);

console.log("=== Fetching main branch ===");
const fetchRes = run('git fetch origin main');

if (fetchRes.success) {
  console.log("=== Adjusting HEAD to match origin/main without changing files ===");
  run('git reset origin/main');

  console.log("=== Git status after reset ===");
  run('git status');

  console.log("=== Staging all changes ===");
  run('git add -A');

  console.log("=== Committing modifications ===");
  const commitMsg = "fix: resolve unit initial coordinates in air and ensure soldiers fight and move correctly";
  const commitRes = run(`git commit -m "${commitMsg}"`);

  if (commitRes.success) {
    const token = process.env.GITHUB_TOKEN;
    if (token && token.trim() !== '') {
      console.log("=== Authenticating remote url ===");
      const authUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
      run(`git remote set-url origin "${authUrl}"`);

      console.log("=== Pushing to repository ===");
      const pushRes = run('git push origin main');

      run(`git remote set-url origin ${publicUrl}`);

      if (pushRes.success) {
        console.log("=== GIT PUSH COMPLETED SUCCESSFULLY ===");
      } else {
        console.log("=== GIT PUSH ENCOUNTERED AN ERROR ===");
      }
    } else {
      console.log("=== ERROR: GITHUB_TOKEN environment variable not set ===");
    }
  } else {
    console.log("Nothing to commit or commit failed.");
  }
} else {
  console.log("Failed to fetch from remote.");
}

try {
  fs.unlinkSync('git-commit-push-pat.ts');
} catch (e) {}
