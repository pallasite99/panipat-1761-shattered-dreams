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

console.log("=== Repairing corrupt .git index ===");

const indexPath = path.join('.git', 'index');
if (fs.existsSync(indexPath)) {
  console.log("Deleting corrupted index file...");
  fs.unlinkSync(indexPath);
  console.log("Deleted.");
}

const corruptObjectPath = path.join('.git', 'objects', '5e', 'c3eca2b4c840bb1de958c0f7c6b7115d2a4cd5');
if (fs.existsSync(corruptObjectPath)) {
  console.log("Deleting corrupt loose object...");
  fs.unlinkSync(corruptObjectPath);
  console.log("Deleted.");
}

console.log("=== Attempting git reset to rebuild index ===");
const resetRes = run('git reset');

if (resetRes.success) {
  console.log("Index rebuilt successfully!");
} else {
  console.log("Standard reset failed, attempting git reset --mixed HEAD...");
  run('git reset --mixed HEAD');
}

console.log("=== Checking Git Status after repair ===");
run('git status');

// Self-delete
try {
  fs.unlinkSync('git-repair.ts');
} catch (e) {}
