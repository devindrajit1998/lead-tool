import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { bulkImportLeads, findDuplicate, normalizePhone } from '../services/leadService';

const SAMPLE_IMPORT_JSON = [
  {
    "business_name": "Royal Palm Banquet & Resort",
    "type": "Events & Hospitality",
    "contact_number": "+919876599881",
    "location": "Electronic City, Bengaluru",
    "google_rating": 4.7,
    "google_reviews_count": 312,
    "status": "New",
    "notes": "Interested in event lead generation."
  },
  {
    "business_name": "Apex Dental Care & Implant Center",
    "type": "Healthcare & Dental",
    "contact_number": "+919876543210",
    "location": "Indiranagar, Bengaluru",
    "google_rating": 4.9,
    "google_reviews_count": 342,
    "status": "New",
    "notes": "This duplicate will be automatically rejected!"
  },
  {
    "business_name": "Horizon Digital Media Agency",
    "type": "Marketing & Advertising",
    "contact_number": "+919876599882",
    "location": "HSR Layout, Bengaluru",
    "google_rating": 4.5,
    "google_reviews_count": 94,
    "status": "Contacted",
    "notes": "Requested marketing audit via WhatsApp."
  }
];

export const BulkImportModal = ({ isOpen, onClose, currentLeads = [], onImportComplete }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setFileError('Please upload a valid .json file.');
      return;
    }

    setFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        setJsonInput(content);
      } catch (err) {
        setFileError('Failed to read file content: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(SAMPLE_IMPORT_JSON, null, 2));
    setFileError('');
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_IMPORT_JSON, null, 2));
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleExecuteImport = async () => {
    setFileError('');
    setImportResult(null);

    let parsed = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (err) {
      setFileError('Invalid JSON syntax. Please verify commas and quotes.');
      return;
    }

    if (!Array.isArray(parsed)) {
      setFileError('JSON must be an array of objects: [ { ... }, { ... } ]');
      return;
    }

    if (parsed.length === 0) {
      setFileError('The provided JSON array is empty.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await bulkImportLeads(parsed, currentLeads);
      setImportResult(result);
      if (onImportComplete && result.addedCount > 0) {
        onImportComplete(result);
      }
    } catch (err) {
      setFileError('Import failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImportResult(null);
    setJsonInput('');
    setFileError('');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card import-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title flex-align">
              <UploadCloud size={22} className="text-primary" />
              Bulk Import Leads from JSON
            </h2>
            <p className="modal-subtitle">
              Upload or paste a JSON array. Duplicates are automatically detected and rejected!
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-form">
          <div className="form-fields-scroll">
            {importResult ? (
              /* Success / Result State */
              <div className="import-result-view animate-fade-in">
                <div className={`result-badge-header ${importResult.addedCount > 0 ? 'success' : 'warning'}`}>
                  {importResult.addedCount > 0 ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    <AlertCircle size={32} />
                  )}
                  <div>
                    <h4>{importResult.message}</h4>
                    <p>
                      {importResult.addedCount} lead(s) successfully added • {importResult.skippedCount} duplicate(s) rejected
                    </p>
                  </div>
                </div>

                {importResult.skipped && importResult.skipped.length > 0 && (
                  <div className="skipped-leads-list">
                    <div className="skipped-header">
                      <span>Rejected Duplicate Leads ({importResult.skipped.length}):</span>
                    </div>
                    <div className="skipped-scroll">
                      {importResult.skipped.map((item, idx) => (
                        <div key={idx} className="skipped-item">
                          <span className="skipped-name">
                            {item.lead.business_name || 'Unnamed Business'}
                          </span>
                          <span className="skipped-reason">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="result-actions">
                  <button type="button" className="btn-secondary" onClick={handleReset}>
                    Import Another File
                  </button>
                  <button type="button" className="btn-primary" onClick={onClose}>
                    Done & View Leads
                  </button>
                </div>
              </div>
            ) : (
              /* Input & Upload State */
              <>
                {/* Drag & Drop or File Selector */}
                <div className="file-drop-zone">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    id="json-file-input"
                    className="file-hidden-input"
                  />
                  <label htmlFor="json-file-input" className="file-drop-label">
                    <FileJson size={34} className="drop-icon" />
                    <span className="drop-title">Click to browse or drop .json file</span>
                    <span className="drop-sub">Accepts standard JSON array with lead objects</span>
                  </label>
                </div>

                {/* Paste Textarea */}
                <div className="form-group">
                  <div className="textarea-header-row">
                    <label className="form-label">Or Paste Raw JSON Array:</label>
                    <div className="sample-btn-group">
                      <button 
                        type="button" 
                        className="text-action-btn"
                        onClick={handleLoadSample}
                        title="Load example leads into box"
                      >
                        Load Sample Data
                      </button>
                      <button 
                        type="button" 
                        className="text-action-btn"
                        onClick={handleCopySample}
                        title="Copy sample JSON structure"
                      >
                        {copiedSample ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedSample ? 'Copied' : 'Copy Sample'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="form-textarea code-font"
                    rows="8"
                    placeholder='[&#10;  {&#10;    "business_name": "Apex Healthcare",&#10;    "contact_number": "+919876543210",&#10;    "location": "Bengaluru",&#10;    "google_rating": 4.8,&#10;    "status": "New"&#10;  }&#10;]'
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setFileError('');
                    }}
                  />
                </div>

                {fileError && (
                  <div className="error-box animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Duplicate Rejection Info Banner */}
                <div className="dedup-info-banner">
                  <Info size={18} className="info-icon" />
                  <div className="dedup-text">
                    <strong>Smart Deduplication Active:</strong> Any lead with an existing phone number or matching business name will be rejected to prevent duplicate outreach.
                  </div>
                </div>
              </>
            )}
          </div>

          {!importResult && (
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExecuteImport}
                disabled={isProcessing || !jsonInput.trim()}
              >
                {isProcessing ? 'Processing & Deduplicating...' : 'Import Leads'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
