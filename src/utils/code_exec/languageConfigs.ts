import { LanguageConfig } from "./types";

export const languageConfigs: Record<string, LanguageConfig> = {
  python: {
    image: "python-runner",
    fileName: "script.py",
    runCommand: "python3 /workspace/{{codeFilePath}}",
  },
  javascript: {
    image: "javascript-runner",
    fileName: "script.js",
    runCommand: "node /workspace/{{codeFilePath}}",
  },
  c: {
    image: "c-runner",
    fileName: "program.c",
    compileCommand: "gcc /workspace/{{codeFilePath}} -o /workspace/program",
    runCommand: "/workspace/program",
  },
  cpp: {
    image: "cpp-runner",
    fileName: "program.cpp",
    compileCommand: "g++ /workspace/{{codeFilePath}} -o /workspace/program",
    runCommand: "/workspace/program",
  },
  java: {
    image: "java-runner",
    fileName: "Main.java",
    compileCommand: "javac /workspace/{{codeFilePath}}",
    runCommand: "java -cp /workspace Main",
  },
  go: {
    image: "go-runner",
    fileName: "script.go",
    runCommand: "go run /workspace/{{codeFilePath}}",
  },
  php: {
    image: "php-runner",
    fileName: "script.php",
    runCommand: "php /workspace/{{codeFilePath}}",
  },
  rust: {
    image: "rust-runner",
    fileName: "main.rs",
    compileCommand: "rustc /workspace/{{codeFilePath}} -o /workspace/binary",
    runCommand: "/workspace/binary",
  },
  r: {
    image: "r-runner",
    fileName: "script.R",
    runCommand: "Rscript /workspace/{{codeFilePath}}",
  },
  elixir: {
    image: "elixir-runner",
    fileName: "script.exs",
    runCommand: "elixir /workspace/{{codeFilePath}}",
  },
  solidity: {
    image: "solidity-runner",
    fileName: "script.sol",
    compileCommand:
      "--optimize --bin /workspace/{{codeFilePath}} -o /workspace",
    runCommand: "cat /workspace/{{codeFilePath}}", // Placeholder
    useEntrypoint: false,
  },
  csharp: {
    image: "csharp-runner",
    fileName: "Program.cs",
    runCommand: "dotnet run --project /workspace",
    useEntrypoint: true,
  },
};
