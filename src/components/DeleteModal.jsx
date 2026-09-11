import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteModal = ({ isOpen, lead, onClose, onConfirm }) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card delete-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">
          <AlertTriangle size={28} />
        </div>
        <h3 className="delete-title">Delete Lead?</h3>
        <p className="delete-desc">
          Are you sure you want to delete <strong>{lead.business_name}</strong>? This action cannot be undone.
        </p>
        <div className="delete-modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger-solid" onClick={() => onConfirm(lead.id)}>
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
};
