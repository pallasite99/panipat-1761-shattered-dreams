var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_child_process = require("child_process");
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/git/push", (req, res) => {
    const { pat, commitMessage } = req.body;
    if (!commitMessage || typeof commitMessage !== "string" || commitMessage.trim() === "") {
      return res.status(400).json({ success: false, error: "Commit message is required" });
    }
    const token = pat && pat.trim() !== "" ? pat.trim() : process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({ success: false, error: "Personal Access Token (PAT) is required" });
    }
    const logs = [];
    function runGit(cmd) {
      logs.push(`> ${cmd}`);
      try {
        const out = (0, import_child_process.execSync)(cmd, { encoding: "utf8", stdio: "pipe" });
        if (out) logs.push(out);
        return { success: true, stdout: out };
      } catch (error) {
        logs.push(`ERROR: ${error.message}`);
        if (error.stdout) logs.push(`stdout: ${error.stdout}`);
        if (error.stderr) logs.push(`stderr: ${error.stderr}`);
        return { success: false, error };
      }
    }
    try {
      runGit('git config user.name "Salil Apte"');
      runGit('git config user.email "salilapte99@gmail.com"');
      console.log("Staging changes in Express server...");
      const addRes = runGit("git add -A");
      if (!addRes.success) {
        return res.status(500).json({ success: false, error: "Failed to stage changes", logs });
      }
      console.log("Committing changes in Express server...");
      const commitRes = runGit(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      if (!commitRes.success) {
        if (logs.some((l) => l.includes("nothing to commit") || l.includes("no changes added to commit"))) {
          return res.json({ success: true, message: "Nothing to commit, repository is already up to date!", logs });
        }
        return res.status(500).json({ success: false, error: "Commit failed", logs });
      }
      const publicUrl = "https://github.com/pallasite99/panipat-1761-shattered-dreams.git";
      const authenticatedUrl = `https://${token}@github.com/pallasite99/panipat-1761-shattered-dreams.git`;
      runGit(`git remote set-url origin "${authenticatedUrl}"`);
      console.log("Pushing to GitHub in Express server...");
      const pushRes = runGit("git push origin main");
      runGit(`git remote set-url origin ${publicUrl}`);
      if (pushRes.success) {
        return res.json({ success: true, message: "Successfully committed and pushed to GitHub remote!", logs });
      } else {
        return res.status(500).json({ success: false, error: "Git push operation failed. See logs for details.", logs });
      }
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message, logs });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Static Build...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
