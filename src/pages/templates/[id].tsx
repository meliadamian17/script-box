import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CodeEditor, { helloWorldCodes } from "../../components/CodeEditor";
import { SupportedLanguages } from "@/utils/templates/types";

const TemplateEditorPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [templateData, setTemplateData] = useState<any>(null);
  const [language, setLanguage] = useState<SupportedLanguages>("python");
  const [theme, setTheme] = useState("dark");
  const [enableVim, setEnableVim] = useState(false);
  const [relativeLineNumbers, setRelativeLineNumbers] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeHistory, setCodeHistory] = useState<Record<SupportedLanguages, string>>({});
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/templates/${id}`);
          if (res.ok) {
            const data = await res.json();
            setTemplateData(data);
            setLanguage(data.language || "python");
            setCodeHistory({
              [data.language || "python"]: data.code || helloWorldCodes[data.language || "python"],
            });
            setTitle(data.title || "");
          } else {
            setErrorMessage("Failed to fetch template.");
          }
        } catch (error) {
          setErrorMessage("Error fetching template.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [id]);

  const saveTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code: codeHistory[language],
          language,
        }),
      });

      if (res.ok) {
        alert("Template saved successfully!");
      } else {
        const error = await res.json();
        setErrorMessage(`Failed to save template: ${error.message}`);
      }
    } catch (err) {
      setErrorMessage("Error: Unable to save template.");
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );
  }

  if (!templateData) {
    return <div className="text-center mt-10 text-red-500">Template not found or you do not have access.</div>;
  }

  return (
    <div className="p-6">
      {/* Editable Title */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <div className="flex flex-col">
          {editingTitle ? (
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full max-w-lg"
              />
              <button className="btn btn-primary" onClick={() => setEditingTitle(false)}>
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-xl font-semibold">{title}</span>
              <button className="btn btn-ghost" onClick={() => setEditingTitle(true)}>
                Edit
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={saveTemplate} disabled={isRunning}>
          Save Template
        </button>
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
          />
        </div>

        {/* Right Column - Input, Output, Run Button */}
        <div className="flex flex-col space-y-4">
          {/* Input Box */}
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

          {/* Run Code Button */}
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

          {/* Output Box */}
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

export default TemplateEditorPage;

