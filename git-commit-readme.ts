import { execSync } from 'child_process';
import fs from 'fs';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out);
    return { success: true, stdout: out };
  } catch (error: any) {
    console.log(`ERROR: ${error.message}`);
    if (error.stdout) console.log("stdout:", error.stdout);
    if (error.stderr) console.log("stderr:", error.stderr);
    return { success: false, error: error };
  }
}

console.log("=== Staging README ===");
run('git add README.md');

console.log("=== Committing README ===");
const commitMsg = "docs: update README with Web3 sovereign ledger, MetaMask integration, and student LMS academy hub details";
const commitRes = run(`git commit -m "${commitMsg}"`);

if (commitRes.success) {
  const token = process.env.GITHUB_TOKEN;

  if (token && token.trim() !== '') {
    console.log("=== GITHUB_TOKEN Found, rewriting remote URL to authenticate ===");
    const authenticatedUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
    
    // Set authenticated URL
    run(`git remote set-url origin "${authenticatedUrl}"`);
    
    console.log("=== Attempting to Push ===");
    const pushRes = run('git push origin main');
    
    // Reset back to public URL for safety
    run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
    
    if (pushRes.success) {
      console.log("=== PUSH SUCCESSFUL ===");
    } else {
      console.log("=== PUSH FAILED ===");
    }
  } else {
    console.log("=== ERROR: GITHUB_TOKEN not found in environment secrets ===");
  }
} else {
  console.log("Commit failed or nothing to commit.");
}

// Self-delete
try {
  fs.unlinkSync('git-commit-readme.ts');
  console.log("Cleaned up git-commit-readme.ts");
} catch (e: any) {
  console.log("Failed to clean up git-commit-readme.ts:", e.message);
}
