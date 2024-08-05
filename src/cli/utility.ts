import { spawn } from "node:child_process";

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
