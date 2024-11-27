import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CodeEditor, { helloWorldCodes } from "../../components/CodeEditor";
import { SupportedLanguages } from "@/utils/templates/types";
import TemplateSidebar from "@/components/TemplateSidebar";
import Alert from "@/components/Alert";

const TemplateEditorPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [preferences, setPreferences] = useState({
    defaultLanguage: "python",
    defaultTheme: "dark",
    enableVim: false,
    relativeLineNumbers: false,
  });
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
  const [description, setDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: "success" | "error" | "warning" | "info" }[]>([]);

  const addAlert = (message: string, type: "success" | "error" | "warning" | "info", duration = 3000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((alert) => alert.id !== id)), duration);
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          setPreferences(data);
          setLanguage(data.defaultLanguage);
          setTheme(data.defaultTheme);
          setEnableVim(data.enableVim);
          setRelativeLineNumbers(data.relativeLineNumbers);
        }
      } catch (error) {
        console.error("Failed to fetch preferences", error);
      }
    };

    fetchPreferences();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/templates/${id}viewOnly=false`);
          if (res.ok) {
            const data = await res.json();
            setTemplateData(data);
            setLanguage(data.language || "python");
            setCodeHistory({
              [data.language || "python"]: data.code || helloWorldCodes[data.language || "python"],
            });
            setDescription(data.description || "")
            setTitle(data.title || "");
          } else {
            addAlert("Failed to fetch template.", "error");
          }
        } catch (error) {
          addAlert("Error fetching template.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [id, preferences]);

  const saveTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          code: codeHistory[language],
          language,
        }),
      });

      if (res.ok) {
        addAlert("Template saved successfully!", "success");
      } else {
        const error = await res.json();
        addAlert(`Failed to save template: ${error.message}`, "error");
      }
    } catch (err) {
      addAlert("Error: Unable to save template.", "error");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveTemplate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveTemplate]);

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

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Template",
          description: "New template",
          code: helloWorldCodes[preferences.defaultLanguage as SupportedLanguages],
          language: preferences.defaultLanguage,
          tags: "",
        }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        addAlert("Template created successfully!", "success");
        router.push(`/templates/${newTemplate.id}`);
      }
    } catch (error) {
      addAlert("Failed to create template.", "error");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        addAlert("Template deleted successfully!", "success");
      }
    } catch (error) {
      addAlert("Failed to delete template.", "error");
    }
  };

  const handleRenameTemplate = async (id: number, name: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name,
        }),
      });

      if (res.ok) {
        addAlert("Template renamed successfully!", "success");
        setTitle(name);
      } else {
        const error = await res.json();
        addAlert(`Failed to rename template: ${error.message}`, "error");
      }
    } catch (err) {
      addAlert("Error: Unable to rename template.", "error");
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
    <div className="flex h-screen">
      <TemplateSidebar
        onCreate={handleCreateTemplate}
        onRename={handleRenameTemplate}
        onDelete={handleDeleteTemplate}
      />
      <div className="p-6 flex-grow">
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

        {/* Editable Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-lg font-semibold mb-2">
            Description
          </label>
          {editingDescription ? (
            <div className="flex items-center space-x-4">
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered w-full max-w-lg"
              />
              <button className="btn btn-primary" onClick={() => setEditingDescription(false)}>
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{description || "No description provided"}</span>
              <button className="btn btn-ghost" onClick={() => setEditingDescription(true)}>
                Edit
              </button>
            </div>
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

      {/* Render Alerts */}
      {alerts.map((alert) => (
        <Alert key={alert.id} message={alert.message} type={alert.type} />
      ))}
    </div>
  );
};

export default TemplateEditorPage;

