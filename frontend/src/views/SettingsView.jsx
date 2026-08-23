import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Eyebrow from "../components/Eyebrow";
import ArrowButton from "../components/ArrowButton";
import { toast } from "../components/ToastHost";
import { useSettings, saveSettings, resetSettings } from "../lib/settings";
import { IconEye, IconEyeOff } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const MODEL_SUGGESTIONS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

export default function SettingsView() {
  const { settings } = useSettings();
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    document.title = "Settings | LiteraAI";
    return () => { document.title = "LiteraAI | Redefining Research with AI"; };
  }, []);

  const set = (patch) => saveSettings({ ...settings, ...patch });

  const save = () => {
    if (!settings.apiKey.trim()) {
      toast("Please enter your OpenAI API key first", "error");
      return;
    }
    saveSettings(settings);
    toast("Settings saved — you're ready to go", "success");
  };

  return (
    <main className="app-main">
      <div className="container-narrow">
        <div className="app-head">
          <Eyebrow>Configuration</Eyebrow>
          <h1 className="app-title">Settings.</h1>
          <p className="app-sub">
            LiteraAI uses OpenAI for both chat and embeddings. Paste your API key below — it is
            stored locally in your browser and sent only with your queries.
          </p>
        </div>

        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="field-group">
            <label htmlFor="model">Chat model</label>
            <input
              id="model"
              type="text"
              className="mono model-input"
              list="model-options"
              value={settings.model}
              onChange={(e) => set({ model: e.target.value })}
              placeholder="e.g. gpt-4o"
            />
            <datalist id="model-options">
              {MODEL_SUGGESTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <small className="field-hint mono">
              Type any OpenAI model name, or pick a suggestion
            </small>
          </div>

          <div className="field-group">
            <label htmlFor="embedding-model">Embedding model</label>
            <input
              id="embedding-model"
              type="text"
              className="mono model-input"
              value={settings.embeddingModel || "text-embedding-3-small"}
              onChange={(e) => set({ embeddingModel: e.target.value })}
              placeholder="text-embedding-3-small"
            />
            <datalist id="embedding-options">
              <option value="text-embedding-3-small" />
              <option value="text-embedding-3-large" />
            </datalist>
            <small className="field-hint mono">Used to index your PDFs into the vector store</small>
          </div>

          <div className="field-group">
            <label htmlFor="apikey">OpenAI API Key</label>
            <div className="key-row">
              <input
                id="apikey"
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => set({ apiKey: e.target.value })}
                placeholder="sk-…"
                autoComplete="off"
              />
              <button type="button" className="key-eye" onClick={() => setShowKey((v) => !v)} title="Toggle visibility">
                {showKey ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            <small className="field-hint mono">Stored in localStorage on this device only · required to use the app</small>
          </div>

          <div className="settings-actions">
            <ArrowButton onClick={save}>Save Settings</ArrowButton>
            <button
              className="btn-flat muted"
              onClick={() => { resetSettings(); toast("Settings reset"); }}
            >
              Reset to defaults
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
