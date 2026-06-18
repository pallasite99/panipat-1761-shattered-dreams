import { execSync } from 'child_process';
try {
  console.log("=== README.md changed in last commit ===");
  console.log(execSync('git show --stat cf6b9c4', { encoding: 'utf8' }));
  
  console.log("=== README.md banner line in previous commits ===");
  try {
    console.log("Commit 2750816:");
    console.log(execSync('git show 2750816:README.md | head -n 10', { encoding: 'utf8' }));
  } catch (e) {}
  try {
    console.log("Commit 5ec3eca:");
    console.log(execSync('git show 5ec3eca:README.md | head -n 10', { encoding: 'utf8' }));
  } catch (e) {}

  console.log("=== Check if readme_banner.png exists in various commits ===");
  for (const sha of ['cf6b9c4', '2750816', '5ec3eca', 'b274f61']) {
    try {
      const ls = execSync(`git ls-tree -r ${sha} | grep readme_banner.png`, { encoding: 'utf8' });
      console.log(`${sha}: ${ls.trim()}`);
    } catch (e) {
      console.log(`${sha}: not found or error`);
    }
  }
} catch (err: any) {
  console.error("Error:", err.message);
}
