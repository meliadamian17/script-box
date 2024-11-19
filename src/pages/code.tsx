// pages/code.tsx
import React, { useState } from "react";
import CodeEditor from "../components/CodeEditor";

const CodeEditorPage = () => {
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("dark");
  const [enableVim, setEnableVim] = useState(false);
  const [relativeLineNumbers, setRelativeLineNumbers] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("# Write your code here!");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin: input }),
      });
      const result = await response.json();
      setOutput(result.output || result.error || "No output");
    } catch (err) {
      setOutput("Error: Unable to run code");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      {/* Language and Theme Selection */}
      <div className="flex items-center space-x-4">
        <select
          className="select select-bordered"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <select
          className="select select-bordered"
          value={theme}
          onChange={handleThemeChange}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="sublime">Sublime</option>
          <option value="monokai">Monokai</option>
          <option value="monokaiDimmed">Monokai Dimmed</option>
          <option value="materialDark">Material Dark</option>
          <option value="materialLight">Material Light</option>
          <option value="material">Material</option>
        </select>
      </div>

      {/* Vim Mode and Relative Line Numbers Checkboxes */}
      <div className="flex items-center space-x-4">
        <label className="label cursor-pointer space-x-2">
          <span className="label-text">Enable Vim Mode</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={enableVim}
            onChange={(e) => setEnableVim(e.target.checked)}
          />
        </label>

        <label className="label cursor-pointer space-x-2">
          <span className="label-text">Relative Line Numbers</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={relativeLineNumbers}
            onChange={(e) => setRelativeLineNumbers(e.target.checked)}
          />
        </label>
      </div>

      {/* Code Editor */}
      <CodeEditor
        language={language}
        theme={theme}
        initialCode={code}
        onCodeChange={setCode}
        enableVim={enableVim}
        relativeLineNumbers={relativeLineNumbers}
      />

      {/* Input Box */}
      <textarea
        className="textarea textarea-bordered w-full max-w-lg"
        rows={3}
        placeholder="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>

      {/* Run Code Button */}
      <button className="btn btn-primary w-full max-w-lg" onClick={handleRunCode}>
        Run Code
      </button>

      {/* Output Box */}
      <div className="w-full max-w-lg p-4 border rounded bg-base-200">
        <h2 className="text-lg font-semibold">Output</h2>
        <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditorPage;

