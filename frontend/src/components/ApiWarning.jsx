import { IconKey } from "../lib/icons";

export default function ApiWarning({ navigate }) {
  return (
    <div className="api-warning" role="alert">
      <span className="api-warning-icon"><IconKey size={20} /></span>
      <div className="api-warning-body">
        <b>API key required.</b> Set your OpenAI API key in Settings to start using LiteraAI.
        <small>Your key is stored locally in your browser and never leaves this device.</small>
      </div>
      <button className="btn-flat api-warning-btn" onClick={() => navigate("settings")}>
        Open Settings
      </button>
    </div>
  );
}
