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

console.log("=== Checking current Git Status ===");
run('git status');

console.log("=== Configuring git user ===");
run('git config user.name "Salil Apte"');
run('git config user.email "salilapte99@gmail.com"');

console.log("=== Staging All Changes ===");
run('git add -A');

console.log("=== Committing Changes ===");
const commitMsg = "feat: add Shaniwar Wada 3D celebration visualizer and interactive dhol beat triggers";
const commitRes = run(`git commit -m "${commitMsg}"`);

if (commitRes.success) {
  console.log("=== Checking Local Commit Log ===");
  run('git log -n 3 --oneline');

  const token = process.env.GITHUB_TOKEN;

  if (token && token.trim() !== '') {
    console.log("=== GITHUB_TOKEN Found, rewriting remote URL to authenticate ===");
    const authenticatedUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
    
    // Set authenticated URL
    run(`git remote set-url origin "${authenticatedUrl}"`);
    
    console.log("=== Attempting to Push ===");
    const pushRes = run('git push origin main');
    
    // Reset back to public URL for safety immediately
    run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
    
    if (pushRes.success) {
      console.log("=== PUSH SUCCESSFUL ===");
    } else {
      console.log("=== PUSH FAILED ===");
    }
  } else {
    console.log("=== ERROR: GITHUB_TOKEN not configures in environment ===");
  }
} else {
  console.log("No changes committed or commit action failed.");
}

// Clean up temporary script
try {
  fs.unlinkSync('git-push-main.ts');
  console.log("Cleaned up git-push-main.ts");
} catch (e: any) {
  console.log("Failed to clean up git-push-main.ts:", e.message);
}
