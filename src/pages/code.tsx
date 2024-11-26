import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CodeEditor, { helloWorldCodes } from "../components/CodeEditor";
import { SupportedLanguages } from "@/utils/templates/types";
import { useAuth } from "@/context/AuthContext";

const CodeEditorPage = () => {
  const router = useRouter();
  const { title, description, language: queryLanguage, code, tags } = router.query;
  const { user } = useAuth();

  const [language, setLanguage] = useState<SupportedLanguages>(
    (queryLanguage as SupportedLanguages) || "python"
  );
  const [theme, setTheme] = useState("dark");
  const [enableVim, setEnableVim] = useState(false);
  const [relativeLineNumbers, setRelativeLineNumbers] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeHistory, setCodeHistory] = useState<Record<SupportedLanguages, string>>(
    Object.fromEntries(
      Object.keys(helloWorldCodes).map((lang) => [lang, helloWorldCodes[lang]])
    ) as Record<SupportedLanguages, string>
  );
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code from query parameter
  useEffect(() => {
    if (queryLanguage && code) {
      const lang = queryLanguage as SupportedLanguages;
      setLanguage(lang);
      setCodeHistory((prev) => ({
        ...prev,
        [lang]: code as string,
      }));
    }
  }, [queryLanguage, code]);

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeHistory[language],
          language,
          stdin: input,
        }),
      });
      const result = await response.json();
      setOutput(result.output || result.error || "No output");
    } catch (err) {
      setOutput("Error: Unable to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguages;
    setLanguage(newLanguage);

    if (!codeHistory[newLanguage]) {
      setCodeHistory((prev) => ({
        ...prev,
        [newLanguage]: helloWorldCodes[newLanguage],
      }));
    }
  };

  const handleCodeChange = (code: string) => {
    setCodeHistory((prev) => ({ ...prev, [language]: code }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title || "Code Editor"}</h1>
        {description && <p className="text-lg mt-2">{description}</p>}
        {tags && (
          <p className="text-sm mt-1 text-gray-500">
            Tags: {tags.toString().split(",").join(", ")}
          </p>
        )}
      </div>

      {/* Editor Options */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        <select
          className="select select-bordered"
          value={language}
          onChange={handleLanguageChange}
          disabled={isRunning}
        >
          {Object.keys(helloWorldCodes).map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={isRunning}
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

        <label className="label cursor-pointer space-x-2">
          <span className="label-text">Enable Vim Mode</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={enableVim}
            onChange={(e) => setEnableVim(e.target.checked)}
            disabled={isRunning}
          />
        </label>

        <label className="label cursor-pointer space-x-2">
          <span className="label-text">Relative Line Numbers</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={relativeLineNumbers}
            onChange={(e) => setRelativeLineNumbers(e.target.checked)}
            disabled={isRunning}
          />
        </label>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Code Editor */}
        <div className="rounded p-4">
          <CodeEditor
            language={language}
            theme={theme}
            initialCode={codeHistory[language]}
            onCodeChange={handleCodeChange}
            enableVim={enableVim}
            relativeLineNumbers={relativeLineNumbers}
            readOnly={isRunning}
            user={user}
          />
        </div>

        {/* Right Column - Input, Output, Run Button */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label htmlFor="input" className="text-lg font-semibold mb-2">
              Input
            </label>
            <textarea
              id="input"
              className="textarea textarea-bordered w-full h-24 resize-y"
              placeholder="Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRunning}
            ></textarea>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="loading loading-spinner mr-2"></span>
                Running...
              </>
            ) : (
              "Run Code"
            )}
          </button>

          <div className="flex flex-col flex-1">
            <label htmlFor="output" className="text-lg font-semibold mb-2">
              Output
            </label>
            <textarea
              id="output"
              className="textarea textarea-bordered w-full h-full resize-y"
              value={isRunning ? "Running..." : output}
              readOnly
              style={{ whiteSpace: "pre-wrap" }}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;

