import React from 'react';
import { 
  Zap, 
  Plus, 
  Database, 
  Download, 
  UploadCloud 
} from 'lucide-react';
import { isFirebaseConnected } from '../firebase';

export const Navbar = ({ 
  onOpenAddModal, 
  onOpenImportModal, 
  onOpenFirebaseModal, 
  leads = [] 
}) => {
  const isConnected = isFirebaseConnected();

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Business Name', 'Category', 'Contact Number', 'Location', 'Google Rating', 'Google Reviews', 'Status', 'Notes'];
    const rows = leads.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.type || '').replace(/"/g, '""')}"`,
      `"${(l.contact_number || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      l.google_rating || 0,
      l.google_reviews_count || 0,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadflow_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand */}
        <div className="brand-wrapper">
          <div className="brand-logo">
            <Zap size={20} className="brand-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-name">
              Lead<span>Flow</span>
            </div>
            <span className="brand-badge">Mobile CRM</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Database sync status indicator */}
          <button 
            className={`db-status-pill ${isConnected ? 'cloud-active' : 'local-active'}`}
            onClick={onOpenFirebaseModal}
            title={isConnected ? 'Connected to Firebase Firestore' : 'Click to connect Firebase database'}
            aria-label="Database Settings"
          >
            <span className="pulsing-indicator" />
            <Database size={14} className="db-icon" />
            <span className="db-text-label">
              {isConnected ? 'Firebase Sync' : 'Local Mode'}
            </span>
          </button>

          {/* Import JSON button */}
          <button
            className="btn-icon-nav"
            onClick={onOpenImportModal}
            title="Bulk import leads from JSON file or text"
            aria-label="Import JSON"
          >
            <UploadCloud size={16} />
            <span className="btn-text-responsive">Import</span>
          </button>

          {/* Export CSV button (tablet/desktop) */}
          <button 
            className="btn-icon-nav desktop-only"
            onClick={handleExportCSV}
            title="Export leads to CSV spreadsheet"
            aria-label="Export CSV"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {/* Primary Add Lead Button */}
          <button 
            className="btn-primary-add"
            onClick={onOpenAddModal}
            title="Add a new lead"
            aria-label="Add new lead"
          >
            <Plus size={18} className="add-icon" />
            <span className="add-btn-text">Add Lead</span>
          </button>
        </div>
      </div>
    </header>
  );
};
