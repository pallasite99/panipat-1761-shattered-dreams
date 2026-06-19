import { execSync } from 'child_process';
import fs from 'fs';

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

console.log("=== Staging Battle Canvas Changes ===");
run('git add src/components/BattleCanvas.tsx');

console.log("=== Committing Tactical Divisions ===");
const commitMsg = "feat: spread troops into 4 strategic divisions and implement holographic target locks inside reticle HUD";
const commitRes = run(`git commit -m "${commitMsg}"`);

if (commitRes.success) {
  console.log("=== Checking Local Commit Log ===");
  run('git log -n 3 --oneline');

  const token = process.env.GITHUB_TOKEN;

  if (token && token.trim() !== '') {
    console.log("=== GITHUB_TOKEN Found, preparing authenticated URL branch ===");
    const authenticatedUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
    
    run(`git remote set-url origin "${authenticatedUrl}"`);
    
    console.log("=== Pushing to remote repository ===");
    const pushRes = run('git push origin main');
    
    run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
    
    if (pushRes.success) {
      console.log("=== PUSH COMPLETED SUCCESSFULLY ===");
    } else {
      console.log("=== PUSH failed ===");
    }
  } else {
    console.log("=== GITHUB_TOKEN was missing. Skipping secure push. ===");
  }
} else {
  console.log("Nothing to commit or commit failed.");
}

try {
  fs.unlinkSync('git-commit-divisions.ts');
  console.log("Cleaned up run file");
} catch (e) {}
