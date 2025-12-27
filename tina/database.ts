import { createDatabase, FilesystemBridge } from "@tinacms/datalayer";
import { MongodbLevel } from "mongodb-level";
import { Level } from "level";
import { Octokit } from "octokit";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "1";

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

export default createDatabase({
  databaseAdapter: (isLocal
    ? new Level("./db")
    : new MongodbLevel({
        collectionName: "tinacms",
        dbName: "tinacms",
        mongoUri: process.env.MONGODB_URI as string,
      })) as any,
  bridge: new FilesystemBridge(process.cwd()),
  gitProvider: {
    onPut: async (key, value) => {
      if (isLocal) return;
      
      const owner = process.env.GITHUB_OWNER!;
      const repo = process.env.GITHUB_REPO!;
      const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
      
      try {
        let sha;
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: key,
            ref: branch,
          });
          if (!Array.isArray(data)) sha = data.sha;
        } catch (e) {
          // File doesn't exist yet
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: key,
          message: `Update ${key} via TinaCMS`,
          content: Buffer.from(value).toString("base64"),
          sha,
          branch,
        });
        console.log(`Synced ${key} to GitHub`);
      } catch (e) {
        console.error("GitHub Sync Error:", e);
      }
    },
    onDelete: async (key) => {
      if (isLocal) return;
      
      const owner = process.env.GITHUB_OWNER!;
      const repo = process.env.GITHUB_REPO!;
      const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
      
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: key,
          ref: branch,
        });
        if (!Array.isArray(data)) {
          await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path: key,
            message: `Delete ${key} via TinaCMS`,
            sha: data.sha,
            branch,
          });
          console.log(`Deleted ${key} from GitHub`);
        }
      } catch (e) {
        console.error("GitHub Delete Error:", e);
      }
    },
  },
});
