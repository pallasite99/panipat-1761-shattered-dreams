import { execSync } from 'child_process';
try {
  console.log("=== Git Remote Verbose ===");
  console.log(execSync('git remote -v', { encoding: 'utf8' }));
  console.log("=== Git Log (Last 5 commits) ===");
  console.log(execSync('git log -n 5 --oneline', { encoding: 'utf8' }));
} catch (e: any) {
  console.error(e.message);
}
