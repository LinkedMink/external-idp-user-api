import { renderFile } from "ejs";
import { spawn } from "node:child_process";
import { writeFile, stat } from "node:fs/promises";
import path from "node:path";

export function spawnAsync(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const spawned = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    spawned.on("error", error => reject(error));
    spawned.on("exit", (code, signal) => {
      if (signal) {
        return reject(signal);
      }
      if (code !== 0) {
        return reject(code);
      }
      resolve();
    });
  });
}

export const execIfFileNotExist = async <T>(path: string, exec: (path: string) => Promise<T>) => {
  try {
    await stat(path);
    console.log(`Config exist, skip: ${path}`);
  } catch {
    console.log(`Config not found, exec: ${path}`);
    return exec(path);
  }
};

const EJS_EXT_LENGTH = ".ejs".length;
export const writeEjsTemplate = (
  ejsPathInTemplateDir: string,
  data: Record<string, unknown>,
  ejsTemplateDir = "cli/templates/"
) => {
  const writePath = ejsPathInTemplateDir.substring(0, ejsPathInTemplateDir.length - EJS_EXT_LENGTH);
  const writeRenderedEjs = async () => {
    const rendered = await renderFile(path.join(ejsTemplateDir, ejsPathInTemplateDir), data);
    return writeFile(writePath, rendered, "utf8");
  };

  return execIfFileNotExist(writePath, writeRenderedEjs);
};
