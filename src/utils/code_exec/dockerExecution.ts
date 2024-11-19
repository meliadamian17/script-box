import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { ExecutionRequest, ExecutionResponse } from "./types";
import { languageConfigs } from "./languageConfigs";

export const executeInDocker = async ({
  language,
  code,
  stdin = "",
}: ExecutionRequest): Promise<ExecutionResponse> => {
  const config = languageConfigs[language];

  if (!config) {
    throw new Error(`[ERROR] Unsupported language: ${language}`);
  }

  const sessionId = uuidv4();
  const tempDir = path.resolve(process.cwd(), "temp", sessionId);
  await fs.mkdir(tempDir, { recursive: true });

  let stdout = "";
  let stderr = "";

  try {
    const codeFilePath = path.join(tempDir, config.fileName);
    await fs.writeFile(codeFilePath, code);

    // Additional setup for C#
    if (language === "csharp") {
      const csprojContent = `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net7.0</TargetFramework>
  </PropertyGroup>
</Project>
`;
      const csprojFilePath = path.join(tempDir, "Program.csproj");
      await fs.writeFile(csprojFilePath, csprojContent);
    }

    let stdinFilePath: string | null = null;
    if (stdin) {
      stdinFilePath = path.join(tempDir, "input.txt");
      await fs.writeFile(stdinFilePath, stdin);
    }

    const volumes = [`-v`, `${tempDir}:/workspace`];
    const workdir = ["-w", "/workspace"];

    const commands: string[] = [];

    if (config.compileCommand) {
      const compileCmd = replacePlaceholders(config.compileCommand, {
        codeFilePath: config.fileName,
      });
      commands.push(compileCmd);
    }

    let runCmd = replacePlaceholders(config.runCommand, {
      codeFilePath: config.fileName,
    });

    if (stdin) {
      runCmd = `cat /workspace/input.txt | ${runCmd}`;
    }

    commands.push(runCmd);

    const commandString = commands.join(" && ");

    let dockerCommand: string[];

    if (config.useEntrypoint === false) {
      dockerCommand = [
        "docker",
        "run",
        "--rm",
        "--cpus=1",
        "--memory=128m",
        "-i",
        ...volumes,
        ...workdir,
        config.image,
        ...commands, // Pass commands directly
      ];
    } else {
      dockerCommand = [
        "docker",
        "run",
        "--rm",
        "--cpus=1",
        "--memory=128m",
        "-i",
        ...volumes,
        ...workdir,
        "--entrypoint",
        "/bin/sh",
        config.image,
        "-c",
        commandString,
      ];
    }

    console.debug(`[DEBUG] Docker command: ${dockerCommand.join(" ")}`);

    await new Promise<void>((resolve, reject) => {
      const process = spawn(dockerCommand[0], dockerCommand.slice(1));

      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Exited with code ${code}`));
        }
      });

      process.on("error", (err) => {
        reject(new Error(`Failed to execute command: ${err.message}`));
      });
    });

    return { output: stdout.trim() };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Execution failed: ${errorMessage}`);
    console.error(`[ERROR] Stdout: ${stdout}`);
    console.error(`[ERROR] Stderr: ${stderr}`);
    throw new Error(
      `Execution failed: ${errorMessage}\nStderr: ${stderr}\nStdout: ${stdout}`,
    );
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[ERROR] Failed to delete temp directory: ${errorMessage}`);
    }
  }
};

function replacePlaceholders(
  command: string,
  replacements: Record<string, string>,
): string {
  return command.replace(/{{(\w+)}}/g, (_, key) => replacements[key] || "");
}
