import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CodeEditor from "../../components/CodeEditor";
import { SupportedLanguages } from "@/utils/templates/types";
import { helloWorldCodes } from "../../components/CodeEditor";

const TemplateEditorPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [templateData, setTemplateData] = useState(null);
  const [language, setLanguage] = useState<SupportedLanguages>("python");
  const [theme, setTheme] = useState("dark");
  const [enableVim, setEnableVim] = useState(false);
  const [relativeLineNumbers, setRelativeLineNumbers] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeHistory, setCodeHistory] = useState<
    Record<SupportedLanguages, string>
  >({});
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false); // Added state for code execution status

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
              [data.language || "python"]:
                data.code || helloWorldCodes[data.language || "python"],
            });
            setTitle(data.title || "");
          } else {
            console.error("Failed to fetch template");
          }
        } catch (error) {
          console.error("Error fetching template:", error);
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
        alert(`Failed to save template: ${error.message}`);
      }
    } catch (err) {
      alert("Error: Unable to save template.");
    }
  };

  const runCode = async () => {
    setIsRunning(true); // Set isRunning to true when code execution starts
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
      setIsRunning(false); // Set isRunning to false when code execution finishes
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
    <div className="flex justify-center items-center">
      <div className="loading loading-ring loading-lg"></div>
    </div>
  }

  if (!templateData) {
    return <div>Template not found or you do not have access.</div>;
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      {/* Editable Title */}
      <div className="flex items-center space-x-4">
        {editingTitle ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full max-w-lg"
            />
            <button
              className="btn btn-primary"
              onClick={() => setEditingTitle(false)}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <span className="text-lg font-semibold">{title}</span>
            <button
              className="btn btn-ghost"
              onClick={() => setEditingTitle(true)}
            >
              Edit
            </button>
          </>
        )}
      </div>

      {/* Language and Theme Selection */}
      <div className="flex items-center space-x-4">
        <select
          className="select select-bordered"
          value={language}
          onChange={handleLanguageChange}
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
        initialCode={codeHistory[language]}
        onCodeChange={handleCodeChange}
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
      <button className="btn btn-primary w-full max-w-lg" onClick={runCode}>
        Run Code
      </button>

      {/* Output Box */}
      <div className="w-full max-w-lg p-4 border rounded bg-base-200">
        <h2 className="text-lg font-semibold">Output</h2>
        <div className="mt-2 whitespace-pre-wrap">
          {isRunning ? (
            <div className="flex justify-center items-center">
              <div className="loading loading-ring loading-lg"></div>
            </div>
          ) : (
            <pre>{output}</pre>
          )}
        </div>
      </div>

      {/* Save Template Button */}
      <button className="btn btn-primary w-full max-w-lg" onClick={saveTemplate}>
        Save Template
      </button>
    </div>
  );
};

export default TemplateEditorPage;

