import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Star, 
  MapPin, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  MoveHorizontal
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getDirectCallUrl, getWhatsAppUrl } from '../utils/formatters';

export const LeadTable = ({ leads, onStatusChange, onEdit, onDelete }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="table-wrapper-outer">
      {/* Mobile Swipe Hint */}
      <div className="table-swipe-indicator">
        <MoveHorizontal size={14} />
        <span>Scroll sideways to view all columns</span>
      </div>

      <div className="table-responsive-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th className="th-business">Business & Type</th>
              <th className="th-location">Location</th>
              <th className="th-rating">Google Rating</th>
              <th className="th-contact">Contact Number</th>
              <th className="th-status">Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const googleMapsUrl = lead.location 
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + ' ' + lead.location)}`
                : null;

              return (
                <tr key={lead.id} className="table-row hover-effect">
                  {/* Business & Type */}
                  <td className="business-cell">
                    <div className="cell-main-title">{lead.business_name}</div>
                    {lead.type && <span className="category-pill-table">{lead.type}</span>}
                    {lead.notes && (
                      <div className="table-lead-note" title={lead.notes}>
                        Note: {lead.notes}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="location-cell">
                    {lead.location ? (
                      <a 
                        href={googleMapsUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="location-link"
                        title="View in Google Maps"
                      >
                        <MapPin size={13} className="pin-icon" />
                        <span className="location-name-text">{lead.location}</span>
                        <ExternalLink size={11} className="ext-icon" />
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Google Reviews */}
                  <td className="rating-cell">
                    <div className="google-rating-box">
                      <span className="google-icon-badge">G</span>
                      <Star size={13} className="star-icon" fill="currentColor" />
                      <span className="rating-val">{Number(lead.google_rating || 0).toFixed(1)}</span>
                      <span className="reviews-count">({lead.google_reviews_count || 0})</span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="contact-cell">
                    <div className="contact-number-wrapper">
                      <span className="phone-display">{lead.contact_number || '—'}</span>
                      {lead.contact_number && (
                        <button 
                          className="copy-btn-icon"
                          onClick={() => handleCopy(lead.id, lead.contact_number)}
                          title={copiedId === lead.id ? 'Copied!' : 'Copy phone'}
                          aria-label="Copy phone number"
                        >
                          {copiedId === lead.id ? (
                            <Check size={13} className="copied-icon" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="status-cell">
                    <StatusBadge 
                      status={lead.status}
                      onChange={(newStatus) => onStatusChange(lead.id, newStatus)}
                    />
                  </td>

                  {/* Quick Actions */}
                  <td className="actions-cell">
                    <div className="table-actions-group">
                      {/* Direct Call Button */}
                      <a
                        href={getDirectCallUrl(lead.contact_number)}
                        className="icon-action-btn call"
                        title={`Direct call to ${lead.contact_number}`}
                        aria-label="Call"
                      >
                        <Phone size={15} />
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsAppUrl(lead.contact_number, lead.business_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-action-btn whatsapp"
                        title={`WhatsApp chat with ${lead.business_name}`}
                        aria-label="WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </a>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(lead)}
                        className="icon-action-btn edit"
                        title="Edit Lead"
                        aria-label="Edit Lead"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(lead)}
                        className="icon-action-btn delete"
                        title="Delete Lead"
                        aria-label="Delete Lead"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
