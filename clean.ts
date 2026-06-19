import { execSync } from 'child_process';
import fs from 'fs';
try {
  execSync('git add git-push-main.ts');
  execSync('git commit -m "chore: clean up temporary git-push-main script"');
  if (process.env.GITHUB_TOKEN) {
    const token = process.env.GITHUB_TOKEN.trim();
    execSync(`git remote set-url origin "https://${token}@github.com/pallasite99/panipat-1761-shattered-dreams.git"`);
    execSync('git push origin main');
    execSync('git remote set-url origin https://github.com/pallasite99/panipat-1761-shattered-dreams.git');
  }
} catch (e: any) {
  console.log(e.message);
}
try {
  fs.unlinkSync('clean.ts');
} catch (e) {}
