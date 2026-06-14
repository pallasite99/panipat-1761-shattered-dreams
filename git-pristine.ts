import { execSync } from 'child_process';
import fs from 'fs';

function run(cmd: string) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error: any) {
    console.error("Exec error:", error.message);
    return null;
  }
}

console.log("=== Undoing Last Temporary Commit (keeping files) ===");
run('git reset --soft HEAD~1');

console.log("=== Removing custom git scripts from filesystem ===");
try {
  fs.unlinkSync('git-commit-push.ts');
  console.log("Deleted git-commit-push.ts successfully.");
} catch (e: any) {
  console.warn("Could not delete git-commit-push.ts:", e.message);
}

// Unstage first, then exclude from add
run('git reset git-pristine.ts');

console.log("=== Staging clean production files and committing ===");
run('git add -A');
const commitMsg = "feat: add strategic map updates and complete local cabinet integration";
run(`git commit -m "${commitMsg}"`);

console.log("=== Checking Log ===");
const log = run('git log -n 3 --oneline');
console.log(log);

// Now self-delete
try {
  fs.unlinkSync('git-pristine.ts');
  console.log("self-deleted git-pristine.ts successfully.");
} catch (e: any) {
  // Ignored
}
