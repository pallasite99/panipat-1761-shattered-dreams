import express from 'express';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // API Route: Git Push
  app.post('/api/git/push', (req, res) => {
    const { pat, commitMessage, branch } = req.body;

    if (!commitMessage || typeof commitMessage !== 'string' || commitMessage.trim() === '') {
      return res.status(400).json({ success: false, error: 'Commit message is required' });
    }

    const targetBranch = (branch && typeof branch === 'string' && branch.trim() !== '') ? branch.trim() : 'main';
    
    // Strict regex validation for branch name to avoid shell injection
    if (!/^[a-zA-Z0-9_\-\/\.]+$/.test(targetBranch)) {
      return res.status(400).json({ success: false, error: 'Invalid branch name pattern. Use alphanumeric characters, hyphens, underscores, slashes, or periods only.' });
    }

    const token = (pat && pat.trim() !== '') ? pat.trim() : process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Personal Access Token (PAT) is required' });
    }

    const logs: string[] = [];
    function runGit(cmd: string) {
      logs.push(`> ${cmd}`);
      try {
        const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
        if (out) logs.push(out);
        return { success: true, stdout: out };
      } catch (error: any) {
        logs.push(`ERROR: ${error.message}`);
        if (error.stdout) logs.push(`stdout: ${error.stdout}`);
        if (error.stderr) logs.push(`stderr: ${error.stderr}`);
        return { success: false, error: error };
      }
    }

    try {
      // 1. Configure user identity if not already set
      runGit('git config user.name "Salil Apte"');
      runGit('git config user.email "salilapte99@gmail.com"');

      // 2. Stage changes
      console.log('Staging changes in Express server...');
      const addRes = runGit('git add -A');
      if (!addRes.success) {
        return res.status(500).json({ success: false, error: 'Failed to stage changes', logs });
      }

      // 3. Commit changes
      console.log('Committing changes in Express server...');
      const commitRes = runGit(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      if (!commitRes.success) {
        // If there are no changes, git commit fails. Let's handle this case gracefully.
        if (logs.some(l => l.includes('nothing to commit') || l.includes('no changes added to commit'))) {
          return res.json({ success: true, message: 'Nothing to commit, repository is already up to date!', logs });
        }
        return res.status(500).json({ success: false, error: 'Commit failed', logs });
      }

      // 4. Set authenticated URL
      const publicUrl = "https://github.com/pallasite99/panipat-1761-shattered-dreams.git";
      const authenticatedUrl = `https://${token}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
      runGit(`git remote set-url origin "${authenticatedUrl}"`);

      // 5. Push to GitHub
      console.log(`Pushing HEAD to remote branch "${targetBranch}" in Express server...`);
      const pushRes = runGit(`git push origin HEAD:${targetBranch}`);

      // 6. Restore public URL for security
      runGit(`git remote set-url origin ${publicUrl}`);

      if (pushRes.success) {
        return res.json({ success: true, message: `Successfully committed and pushed to remote branch "${targetBranch}" on GitHub!`, logs });
      } else {
        return res.status(500).json({ success: false, error: `Git push to branch "${targetBranch}" failed. See logs for details.`, logs });
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message, logs });
    }
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Static Build...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
