import { execSync } from 'child_process';

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

console.log("=== Staging and Committing Changes ===");
run('git add -A');
const commitMsg = "feat: add strategic map updates and complete local cabinet integration";
console.log(`Committing with message: "${commitMsg}"...`);
run(`git commit -m "${commitMsg}"`);

console.log("=== Checking Local Commit Head ===");
run('git log -n 3 --oneline');

const token = process.env.GITHUB_TOKEN;

if (token) {
  console.log("=== GITHUB_TOKEN Found, rewriting remote URL to authenticate ===");
  const authenticatedUrl = `https://${token}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
  // Set the remote URL to the authenticated one
  run(`git remote set-url origin ${authenticatedUrl}`);
  
  console.log("=== Attempting to Push with Token ===");
  const pushRes = run('git push origin main');
  
  // Clean back to the public URL for safety immediately after pushing
  run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
  
  if (pushRes.success) {
    console.log("=== PUSH SUCCESSFUL ===");
  } else {
    console.log("=== PUSH FAILED ===");
  }
} else {
  console.log("=== GITHUB_TOKEN Not Found, trying standard push ===");
  const pushRes = run('git push origin main --porcelain');
  if (!pushRes.success) {
    console.log("\n=== AUTHENTICATION INFO ===");
    console.log("A GitHub Token is required to push changes directly from this container.");
    console.log("To authenticate automatically, please set GITHUB_TOKEN in your platform environment secrets (Settings -> Secrets).");
  }
}
