import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log("=== Attempting to check out clean public/readme_banner.png from commit 2750816 ===");
  execSync('git checkout 2750816 -- public/readme_banner.png');
  
  // Verify after checkout
  const buf = fs.readFileSync('public/readme_banner.png');
  console.log("File size after git checkout:", buf.length);
  console.log("First 8 bytes (PNG hex header):", buf.slice(0, 8).toString('hex'));
} catch (e: any) {
  console.error("Git checkout failed, trying execSync back up...", e.message);
  try {
    const rawBuf = execSync('git show 2750816:public/readme_banner.png', { encoding: 'buffer' });
    fs.writeFileSync('public/readme_banner.png', rawBuf);
    console.log("Restored via git show. Size:", rawBuf.length);
    console.log("First 8 bytes:", rawBuf.slice(0, 8).toString('hex'));
  } catch (err: any) {
    console.error("Fallback failed:", err.message);
  }
}
