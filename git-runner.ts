import { execSync } from 'child_process';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out || '(no output)');
  } catch (err: any) {
    console.log(`ERROR: ${err.message}`);
    if (err.stdout) console.log('stdout:', err.stdout);
    if (err.stderr) console.log('stderr:', err.stderr);
  }
}

console.log("=== Git Status ===");
run("git status");

console.log("=== Git Remote ===");
run("git remote -v");

console.log("=== Git Envs (Filter) ===");
const envs = Object.keys(process.env).filter(k => k.toLowerCase().includes('git') || k.toLowerCase().includes('token') || k.toLowerCase().includes('pat') || k.toLowerCase().includes('key'));
console.log("Keys found:", envs);
for (const k of envs) {
  const mask = process.env[k] ? (process.env[k]!.substring(0, 4) + '...' + process.env[k]!.substring(process.env[k]!.length - 4)) : 'empty';
  console.log(`${k}: ${mask}`);
}
