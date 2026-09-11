import React, { useState } from 'react';
import { X, Database, ShieldCheck, ExternalLink, RefreshCw, Trash2, Check } from 'lucide-react';
import { 
  getActiveFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  isFirebaseConnected 
} from '../firebase';

export const FirebaseModal = ({ isOpen, onClose, onResetMock }) => {
  const isConnected = isFirebaseConnected();
  const currentConfig = getActiveFirebaseConfig();

  const [jsonInput, setJsonInput] = useState('');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  const handleJsonPaste = (e) => {
    const val = e.target.value;
    setJsonInput(val);
    setParseError('');

    try {
      // Try to extract firebaseConfig object if full JS code was pasted
      let toParse = val.trim();
      if (toParse.includes('const firebaseConfig =')) {
        toParse = toParse.split('const firebaseConfig =')[1].split(';')[0].trim();
      }
      // Handle JS object syntax (keys without quotes) if needed
      if (!toParse.startsWith('{')) return;

      const obj = JSON.parse(toParse.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'));
      if (obj.projectId) setProjectId(obj.projectId);
      if (obj.apiKey) setApiKey(obj.apiKey);
      if (obj.authDomain) setAuthDomain(obj.authDomain);
      if (obj.storageBucket) setStorageBucket(obj.storageBucket);
      if (obj.messagingSenderId) setMessagingSenderId(obj.messagingSenderId);
      if (obj.appId) setAppId(obj.appId);
    } catch {
      // ignore until user submits
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!projectId.trim() || !apiKey.trim()) {
      setParseError('Project ID and API Key are required to connect Firebase.');
      return;
    }

    const config = {
      projectId: projectId.trim(),
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || '',
      appId: appId.trim() || '',
    };

    saveFirebaseConfig(config);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card config-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title flex-align">
              <Database size={20} className="text-primary" />
              Firebase Firestore Configuration
            </h2>
            <p className="modal-subtitle">
              Connect your free Firebase Firestore database or use local demo mode.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Current Connection Status Banner */}
        <div className={`status-banner ${isConnected ? 'connected' : 'local'}`}>
          <div className="banner-icon">
            {isConnected ? <ShieldCheck size={22} /> : <Database size={22} />}
          </div>
          <div className="banner-info">
            <strong>{isConnected ? 'Firebase Cloud Connected' : 'Local Storage Mode (Active)'}</strong>
            <p>
              {isConnected 
                ? `Connected to Firestore project: ${currentConfig?.projectId}. Leads are saved directly in your cloud database in real-time.`
                : 'All changes are safely stored in your browser storage. You can connect your Firebase project anytime below.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-fields-scroll">
            {/* Paste snippet box */}
            <div className="form-group">
              <label className="form-label">
                Quick Paste (firebaseConfig object from Firebase Console):
              </label>
              <textarea
                className="form-textarea code-font"
                rows="3"
                placeholder='Paste: const firebaseConfig = { apiKey: "...", projectId: "..." };'
                value={jsonInput}
                onChange={handleJsonPaste}
              />
            </div>

            <div className="divider-text">
              <span>OR ENTER FIELDS MANUALLY</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Project ID *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="my-leads-app-123"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">API Key *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="AIzaSyD..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Auth Domain</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="my-leads-app.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">App ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1:123456789:web:abcdef"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
            </div>

            {parseError && <div className="error-box">{parseError}</div>}

            {/* Quick guide */}
            <div className="firebase-guide-box">
              <div className="guide-title">
                <span>How to get free Firebase database:</span>
                <a 
                  href="https://console.firebase.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="guide-link"
                >
                  Firebase Console <ExternalLink size={12} />
                </a>
              </div>
              <ol className="guide-steps">
                <li>Go to Firebase Console and click <strong>Create a project</strong> (100% Free Spark Plan).</li>
                <li>Go to <strong>Build &gt; Firestore Database</strong> and click <strong>Create database</strong> (choose Test Mode).</li>
                <li>Go to <strong>Project Settings &gt; General &gt; Your apps</strong>, select Web (<code>&lt;/&gt;</code>) and copy the <code>firebaseConfig</code> keys!</li>
              </ol>
            </div>
          </div>

          <div className="modal-footer">
            {isConnected ? (
              <button 
                type="button" 
                className="btn-danger" 
                onClick={clearFirebaseConfig}
                title="Disconnect Firebase and return to Local Storage mode"
              >
                <Trash2 size={15} /> Disconnect Firebase
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { onResetMock(); onClose(); }}
                title="Reset sample mock leads"
              >
                <RefreshCw size={15} /> Reset Sample Data
              </button>
            )}

            <button type="submit" className="btn-primary">
              <Check size={16} /> Save & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
