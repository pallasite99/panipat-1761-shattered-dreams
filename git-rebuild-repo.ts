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

console.log("=== RE-INITIALIZING CORRUPTED GIT REPOSITORY ===");

// 1. Delete .git folder safely
const gitDir = '.git';
if (fs.existsSync(gitDir)) {
  console.log("Deleting corrupted .git directory...");
  fs.rmSync(gitDir, { recursive: true, force: true });
  console.log("Deleted corrupted .git directory.");
}

// 2. Initialise a clean new git repository
run('git init -b main');

// 3. Set standard config
run('git config user.name "AI Studio Assistant"');
run('git config user.email "assistant@aistudio.google"');

// 4. Add the remote URL
const publicUrl = "https://github.com/pallasite99/panipat-1761-shattered-dreams.git";
run(`git remote add origin ${publicUrl}`);

console.log("=== Fetching clean history from remote ===");
const fetchRes = run('git fetch origin main');

if (fetchRes.success) {
  console.log("=== Resetting working tree to match origin/main (mixed reset) ===");
  // This points index/HEAD at origin/main, keeping all local modified files as modified!
  run('git reset origin/main');

  console.log("=== Checking current Git Status ===");
  run('git status');

  console.log("=== Staging all modified and new files ===");
  run('git add -A');

  console.log("=== Committing the changes with clear description ===");
  const commitMsg = "feat: add interactive Shaniwar Wada victory celebration visualizer and update README";
  const commitRes = run(`git commit -m "${commitMsg}"`);

  if (commitRes.success) {
    const token = process.env.GITHUB_TOKEN;

    if (token && token.trim() !== '') {
      console.log("=== GITHUB_TOKEN Found! Rewriting remote URL for push authentication ===");
      const authenticatedUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
      run(`git remote set-url origin "${authenticatedUrl}"`);

      console.log("=== Attempting to push changes to main branch ===");
      const pushRes = run('git push origin main');

      // Reset back to public URL for safety immediately after pushing
      run(`git remote set-url origin ${publicUrl}`);

      if (pushRes.success) {
        console.log("=== REPOSITORY SYNCHRONIZED SUCCESSFULLY ===");
      } else {
        console.log("=== PUSH ENCOUNTERED AN ERROR ===");
      }
    } else {
      console.log("=== WARNING: GITHUB_TOKEN not found in environment secrets. Attempting standard push... ===");
      const pushRes = run('git push origin main');
      if (pushRes.success) {
        console.log("=== PUSH SUCCESSFUL ===");
      } else {
        console.log("=== PUSH FAILED (authenticating token required) ===");
      }
    }
  } else {
    console.log("Commit failed or nothing to commit.");
  }
} else {
  console.log("Fetch action failed. Remote check could not complete.");
}

// Clean up temporary script
try {
  fs.unlinkSync('git-rebuild-repo.ts');
} catch (e) {}
