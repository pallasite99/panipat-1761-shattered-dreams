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

console.log("=== Attempting standard Git index repair ===");
run('rm -f .git/index');
run('git reset --mixed HEAD');
run('git status');
