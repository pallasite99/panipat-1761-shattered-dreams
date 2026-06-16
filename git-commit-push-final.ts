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

console.log("=== Staging Changes ===");
run('git add package.json package-lock.json src/lms/LMSProvider.tsx src/screens/Treasury.tsx src/types.ts');

console.log("=== Committing Changes ===");
const commitMsg = "fix: resolve React namespace, add missing zustand dependency, and define LEARNING_HUB screen enum";
const commitRes = run(`git commit -m "${commitMsg}"`);

if (commitRes.success) {
  console.log("=== Checking Local Commits ===");
  run('git log -n 3 --oneline');

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

// Now self-delete to keep working directory clean
try {
  fs.unlinkSync('git-commit-push-final.ts');
  console.log("Cleaned up git-commit-push-final.ts");
} catch (e: any) {
  console.log("Failed to clean up git-commit-push-final.ts:", e.message);
}
