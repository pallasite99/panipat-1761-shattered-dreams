import fs from 'fs';
try {
  const buf = fs.readFileSync('public/readme_banner.png');
  console.log("File size:", buf.length);
  console.log("First 8 bytes (PNG hex header should be 89 50 4e 47 0d 0a 1a 0a):");
  console.log(buf.slice(0, 8).toString('hex'));
  console.log("First 100 bytes as string (in case it is text):");
  console.log(buf.slice(0, 100).toString('utf8'));
} catch (e: any) {
  console.error(e);
}
