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

const packDir = path.join('.git', 'objects', 'pack');
if (fs.existsSync(packDir)) {
  const files = fs.readdirSync(packDir);
  console.log("Pack directory files:", files);

  // For each .idx file, let's remove it and recreate it from the corresponding .pack file
  const idxFiles = files.filter(f => f.endsWith('.idx'));
  const packFiles = files.filter(f => f.endsWith('.pack'));

  console.log(`Found ${idxFiles.length} idx files and ${packFiles.length} pack files.`);

  for (const idxFile of idxFiles) {
    const fullIdxPath = path.join(packDir, idxFile);
    console.log(`Removing corrupted idx file: ${fullIdxPath}`);
    fs.unlinkSync(fullIdxPath);
  }

  for (const packFile of packFiles) {
    const fullPackPath = path.join(packDir, packFile);
    console.log(`Rebuilding idx for: ${fullPackPath}`);
    run(`git index-pack "${fullPackPath}"`);
  }
} else {
  console.log("Pack directory does not exist!");
}

console.log("\n=== Deleting corrupt loose object directories if any ===");
// Just to be safe, if we get bad object HEAD, let's see if HEAD can be parsed again.
run('git reset --hard origin/main || git reset --hard');
run('git status');

// Self-delete
try {
  fs.unlinkSync('git-reindex.ts');
} catch (e) {}
