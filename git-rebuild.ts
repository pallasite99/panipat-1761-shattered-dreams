import { execSync } from 'child_process';

function run(cmd: string) {
  try {
    console.log(`\n> ${cmd}`);
    const out = execSync(cmd, { encoding: 'utf8' });
    if (out) console.log(out.trim());
    return { success: true, out };
  } catch (err: any) {
    console.error(`ERROR: ${err.message}`);
    if (err.stdout) console.log("stdout:", err.stdout);
    if (err.stderr) console.log("stderr:", err.stderr);
    return { success: false, err };
  }
}

console.log("=== Rebuilding corrupted Git repository metabase ===");

// 1. Remove old corrupt .git folder
run('rm -rf .git');

// 2. Re-initialize a clean Git repo
run('git init');

// 3. Configure remote origin
run('git remote add origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');

// 4. Fetch the remote main branch
run('git fetch origin main');

// 5. Force align our HEAD to origin/main WITHOUT modifying current file contents on disk 
// --mixed keeps all our current modifications as un-staged changes
run('git reset --mixed origin/main');

// 6. See our modifications
run('git status');
