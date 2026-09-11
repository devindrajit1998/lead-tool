import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Star, 
  MapPin, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getDirectCallUrl, getWhatsAppUrl } from '../utils/formatters';

export const LeadCard = ({ lead, onStatusChange, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyPhone = (e) => {
    e.stopPropagation();
    if (lead.contact_number) {
      navigator.clipboard.writeText(lead.contact_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const googleMapsUrl = lead.location 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + ' ' + lead.location)}`
    : null;

  return (
    <div className="lead-card animate-fade-in">
      {/* Top Bar: Category & Status & Actions Menu */}
      <div className="lead-card-header">
        <div className="lead-card-badges">
          {lead.type && <span className="category-pill">{lead.type}</span>}
        </div>
        <div className="lead-card-top-actions">
          <StatusBadge 
            status={lead.status} 
            onChange={(newStatus) => onStatusChange(lead.id, newStatus)} 
          />
          <div className="card-menu-container">
            <button 
              className="card-menu-btn" 
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="card-menu-dropdown animate-fade-in">
                <button 
                  onClick={() => { setShowMenu(false); onEdit(lead); }}
                  className="menu-item"
                >
                  <Edit3 size={15} /> Edit Lead
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onDelete(lead); }}
                  className="menu-item delete"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Title & Google Rating */}
      <div className="lead-card-body">
        <h3 className="business-title">{lead.business_name}</h3>
        
        {/* Google Reviews & Rating Bar */}
        <div className="rating-location-row">
          <div className="google-rating-box" title="Google Review Rating">
            <span className="google-icon-badge">G</span>
            <Star size={14} className="star-icon" fill="currentColor" />
            <span className="rating-val">{Number(lead.google_rating || 0).toFixed(1)}</span>
            <span className="reviews-count">({lead.google_reviews_count || 0} reviews)</span>
          </div>

          {lead.location && (
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="location-tag"
              title="Open in Google Maps"
            >
              <MapPin size={13} className="pin-icon" />
              <span className="location-text">{lead.location}</span>
              <ExternalLink size={11} className="ext-icon" />
            </a>
          )}
        </div>

        {/* Contact Phone Row */}
        <div className="contact-row">
          <span className="phone-text">{lead.contact_number || 'No phone added'}</span>
          {lead.contact_number && (
            <button 
              className="copy-btn" 
              onClick={handleCopyPhone}
              title={copied ? 'Copied!' : 'Copy phone number'}
            >
              {copied ? <Check size={13} className="copied-icon" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* Notes Accordion if available */}
        {lead.notes && (
          <div className="notes-container">
            <button 
              className="notes-toggle-btn"
              onClick={() => setExpandedNotes(!expandedNotes)}
            >
              <span>Notes</span>
              {expandedNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expandedNotes && (
              <p className="notes-content animate-fade-in">{lead.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* ACTION BAR: Direct Call & WhatsApp Buttons */}
      <div className="lead-card-actions">
        <a 
          href={getDirectCallUrl(lead.contact_number)}
          className="action-btn call-btn"
          title={`Direct call to ${lead.contact_number}`}
        >
          <Phone size={18} className="btn-icon" />
          <span className="btn-label">Call Now</span>
        </a>

        <a 
          href={getWhatsAppUrl(lead.contact_number, lead.business_name)}
          target="_blank" 
          rel="noopener noreferrer"
          className="action-btn whatsapp-btn"
          title={`WhatsApp chat with ${lead.business_name}`}
        >
          <MessageCircle size={18} className="btn-icon" />
          <span className="btn-label">WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
