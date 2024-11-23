import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { r } from "codemirror-lang-r";
import { csharp } from "@replit/codemirror-lang-csharp";
import { elixir } from "codemirror-lang-elixir"
import { vim } from "@replit/codemirror-vim";
import { lineNumbersRelative } from "@uiw/codemirror-extensions-line-numbers-relative";
import { dracula, githubLight, sublime, monokai, monokaiDimmed } from "@uiw/codemirror-themes-all";
import { SupportedLanguages } from "@/utils/templates/types"


interface CodeEditorProps {
  language: SupportedLanguages;
  theme: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  enableVim: boolean;
  relativeLineNumbers: boolean;
}

export const helloWorldCodes: Record<SupportedLanguages, string> = {
  python: 'print("Hello, World!")',
  javascript: 'console.log("Hello, World!");',
  cpp: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  c: '#include <stdio.h>\nint main() {\n printf("Hello, World!");\n     return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  go: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  php: '<?php\necho "Hello, World!";\n',
  rust: 'fn main() {\n    println!("Hello, World!");\n}',
  r: 'print("Hello, World!")',
  elixir: 'IO.puts("Hello World!")',
  csharp: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  theme,
  initialCode = "",
  onCodeChange,
  enableVim,
  relativeLineNumbers,
}) => {
  const [code, setCode] = useState(initialCode || helloWorldCodes[language]);

  useEffect(() => {
    setCode(initialCode || helloWorldCodes[language]);
  }, [language, initialCode]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (onCodeChange) onCodeChange(value);
  };

  const languageExtensions: Record<SupportedLanguages, any> = {
    python: python(),
    javascript: javascript(),
    cpp: cpp(),
    c: cpp(),
    java: java(),
    go: go(),
    php: php(),
    rust: rust(),
    r: r(),
    csharp: csharp(),
    elixir: elixir(),
  };

  const themeExtensions = {
    light: githubLight,
    dark: dracula,
    sublime: sublime,
    monokai: monokai,
    monokaiDimmed: monokaiDimmed,
  };

  const extensions = [
    languageExtensions[language],
    enableVim ? vim() : null,
    relativeLineNumbers ? lineNumbersRelative : null,
  ].filter(Boolean);

  return (
    <div className="rounded-md border-2">
      <CodeMirror
        value={code}
        extensions={extensions}
        theme={themeExtensions[theme]}
        minWidth="100%"
        minHeight="500px"
        onChange={handleCodeChange}
      />
    </div>
  );
};

export default CodeEditor;

