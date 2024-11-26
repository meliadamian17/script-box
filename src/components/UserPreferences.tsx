import React, { useState, useEffect } from "react";
import Alert from "./Alert";

const PreferencesSection = () => {
  const [preferences, setPreferences] = useState({
    defaultLanguage: "python",
    defaultTheme: "dark",
    enableVim: false,
    relativeLineNumbers: false,
  });
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);

  const addAlert = (message: string, type: "success" | "error", duration = 3000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((alert) => alert.id !== id)), duration);
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/user/preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      } else {
        throw new Error("Failed to fetch preferences");
      }
    } catch (error) {
      addAlert(error.message || "Error fetching preferences", "error");
    }
  };

  const savePreferences = async () => {
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        addAlert("Preferences saved successfully!", "success");
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      addAlert(error.message || "Error saving preferences", "error");
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="card shadow-lg bg-base-200 p-6">
      <h2 className="text-xl font-bold mb-4">Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Default Language</label>
          <select
            name="defaultLanguage"
            value={preferences.defaultLanguage}
            onChange={handleInputChange}
            className="select select-bordered w-full"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="php">PHP</option>
            <option value="rust">Rust</option>
            <option value="csharp">C#</option>
            <option value="elixir">Elixir</option>
            <option value="r">R</option>
          </select>
        </div>
        <div>
          <label className="label">Default Theme</label>
          <select
            name="defaultTheme"
            value={preferences.defaultTheme}
            onChange={handleInputChange}
            className="select select-bordered w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sublime">Sublime</option>
            <option value="monokai">Monokai</option>
            <option value="monokaiDimmed">Monokai Dimmed</option>
          </select>
        </div>
        <div>
          <label className="label cursor-pointer">
            <span className="label-text">Enable Vim Mode</span>
            <input
              type="checkbox"
              name="enableVim"
              checked={preferences.enableVim}
              onChange={handleInputChange}
              className="toggle toggle-primary"
            />
          </label>
        </div>
        <div>
          <label className="label cursor-pointer">
            <span className="label-text">Enable Relative Line Numbers</span>
            <input
              type="checkbox"
              name="relativeLineNumbers"
              checked={preferences.relativeLineNumbers}
              onChange={handleInputChange}
              className="toggle toggle-primary"
            />
          </label>
        </div>
      </div>
      <div className="mt-4">
        <button className="btn btn-outline btn-primary" onClick={savePreferences}>
          Save Preferences
        </button>
      </div>

      {alerts.map((alert) => (
        <Alert key={alert.id} message={alert.message} type={alert.type} />
      ))}
    </div>
  );
};

export default PreferencesSection;

