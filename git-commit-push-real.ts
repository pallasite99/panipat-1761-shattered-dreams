import { execSync } from 'child_process';
import fs from 'fs';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out || '(no output)');
    return { success: true, stdout: out };
  } catch (err: any) {
    console.log(`ERROR: ${err.message}`);
    if (err.stdout) console.log('stdout:', err.stdout);
    if (err.stderr) console.log('stderr:', err.stderr);
    return { success: false, error: err };
  }
}

// 1. Remove diagnostic git-runner.ts so it doesn't get tracked
try {
  if (fs.existsSync('git-runner.ts')) {
    fs.unlinkSync('git-runner.ts');
    console.log('Removed git-runner.ts diagnostic file');
  }
} catch (e: any) {
  console.log('Error deleting git-runner.ts:', e.message);
}

// 2. Configure Git user identities
console.log('=== Configuring Git user ===');
run('git config user.name "Salil Apte"');
run('git config user.email "salilapte99@gmail.com"');

// 3. Stage the files explicitly
console.log('=== Staging Files ===');
run('git add README.md src/components/BattleCanvas.tsx src/components/PuneCelebrationVisual.tsx src/screens/BattleScene.tsx');

// 4. Commit changes
console.log('=== Committing Changes ===');
const m = 'feat: reduce Maratha casualties at Udgir, add first-person terrain cannons, and walking generals parade';
const commitRes = run(`git commit -m "${m}"`);

if (commitRes.success) {
  console.log('=== Commit OK. Checking Log ===');
  run('git log -n 2 --oneline');

  // 5. Build remote with GITHUB_TOKEN
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim() !== '') {
    console.log('=== Setting Authenticated Remote ===');
    const remoteUrl = `https://${token.trim()}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
    
    // Switch connection URL
    run(`git remote set-url origin "${remoteUrl}"`);

    // 6. Push
    console.log('=== Pushing to origin main ===');
    const pushRes = run('git push origin main');

    // 7. Revert to public url
    run('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');

    if (pushRes.success) {
      console.log('=== SUCCESS: CHANGES PUSHED TO REMOTE REPO! ===');
    } else {
      console.log('=== FAILURE: Push operation failed. ===');
    }
  } else {
    console.log('=== ERROR: GITHUB_TOKEN is empty or missing! ===');
  }
} else {
  console.log('=== ERROR: Commit failed. Nothing committed. ===');
}

// Self-destruct script for tidiness
try {
  fs.unlinkSync('git-commit-push-real.ts');
  console.log('Cleaned up git-commit-push-real.ts');
} catch (e: any) {
  console.log('Failed to clean up git-commit-push-real.ts:', e.message);
}
