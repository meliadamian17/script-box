import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CodeEditor from "@/components/CodeEditor";
import Alert from "@/components/Alert";
import { useAuth } from "@/context/AuthContext";

const ViewOnlyTemplatePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [templateData, setTemplateData] = useState<any>(null);
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: "success" | "error" | "warning" | "info" }[]>([]);

  const addAlert = (message: string, type: "success" | "error" | "warning" | "info", duration = 3000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((alert) => alert.id !== id)), duration);
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/templates/${id}`);
          if (res.ok) {
            const data = await res.json();
            setTemplateData(data);
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
  }, [id]);

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: templateData?.code || "",
          language: templateData?.language || "python",
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

  const forkTemplate = async () => {
    if (user) {
      try {
        const res = await fetch(`/api/templates/fork`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: templateData.id,
            title: `${templateData.title} (Forked)`,
            description: templateData.description,
            tags: templateData.tags,
            code: templateData.code,
          }),
        });

        if (res.ok) {
          const forkedTemplate = await res.json();
          router.push(`/templates/${forkedTemplate.id}`);
        } else {
          const error = await res.json();
          console.error("Failed to fork template:", error.error);
        }
      } catch (error) {
        console.error("Error forking template:", error);
      }
    } else {
      router.push({
        pathname: `/code`,
        query: {
          id: templateData.id,
          title: templateData.title,
          description: templateData.description,
          language: templateData.language,
          code: templateData.code,
          tags: templateData.tags,
        },
      });
    }
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
    <div className="p-6 h-screen">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold">{templateData.title}</h1>
        <p className="text-gray-500">{templateData.description}</p>

        <CodeEditor
          language={templateData.language}
          theme={theme}
          initialCode={templateData.code}
          enableVim={false}
          relativeLineNumbers={false}
          onCodeChange={() => { }}
          readOnly={true}
        />

        <div className="flex items-center space-x-4">
          <label className="text-lg font-semibold">Theme</label>
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
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="input" className="text-lg font-semibold mb-2">
              Input
            </label>
            <textarea
              id="input"
              className="textarea textarea-bordered w-full h-24 resize-y"
              placeholder="Enter input here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRunning}
            ></textarea>
          </div>

          <div>
            <label htmlFor="output" className="text-lg font-semibold mb-2">
              Output
            </label>
            <textarea
              id="output"
              className="textarea textarea-bordered w-full h-24 resize-y"
              value={isRunning ? "Running..." : output}
              readOnly
              style={{ whiteSpace: "pre-wrap" }}
            ></textarea>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            className="btn btn-primary"
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

          <button
            className="btn btn-secondary"
            onClick={forkTemplate}
          >
            Fork Template
          </button>
        </div>
      </div>

      {alerts.map((alert) => (
        <Alert key={alert.id} message={alert.message} type={alert.type} />
      ))}
    </div>
  );
};

export default ViewOnlyTemplatePage;

