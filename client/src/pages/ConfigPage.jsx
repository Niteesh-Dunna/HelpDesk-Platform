import { useEffect, useState } from "react";
import API from "../services/api";

export default function ConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // fetch current config
  const fetchConfig = async () => {
    try {
      const res = await API.get("/config");
      setConfig(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching config:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put("/config", config);
      alert("✅ Settings updated");
    } catch (err) {
      alert("Error saving config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading config...</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Config</h1>

      <div className="space-y-4">
        {/* Auto-close toggle */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoCloseEnabled}
              onChange={(e) =>
                setConfig({ ...config, autoCloseEnabled: e.target.checked })
              }
            />
            <span>Enable Auto-Close</span>
          </label>
        </div>

        {/* Confidence threshold */}
        <div>
          <label className="block font-semibold mb-1">
            Confidence Threshold (0–1)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={config.confidenceThreshold}
            onChange={(e) =>
              setConfig({
                ...config,
                confidenceThreshold: Number(e.target.value),
              })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        {/* SLA hours */}
        <div>
          <label className="block font-semibold mb-1">SLA Hours</label>
          <input
            type="number"
            min="1"
            value={config.slaHours}
            onChange={(e) =>
              setConfig({ ...config, slaHours: Number(e.target.value) })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
