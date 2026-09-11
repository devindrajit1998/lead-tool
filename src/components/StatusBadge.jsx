import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, ChevronDown } from 'lucide-react';

export const STATUS_OPTIONS = [
  { id: 'New', label: 'New Lead', colorVar: 'new' },
  { id: 'Contacted', label: 'Contacted', colorVar: 'contacted' },
  { id: 'Follow Up', label: 'Follow Up', colorVar: 'followup' },
  { id: 'Not Answered', label: 'Not Answered', colorVar: 'notanswered' },
  { id: 'Interested', label: 'Interested', colorVar: 'interested' },
  { id: 'Closed Won', label: 'Closed Won 🎉', colorVar: 'closedwon' },
  { id: 'Closed Lost', label: 'Closed Lost', colorVar: 'closedlost' },
];

export const StatusBadge = ({ status = 'New', onChange, interactive = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (option) => {
    setIsOpen(false);
    if (option.id === 'Closed Won' && status !== 'Closed Won') {
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // confetti fallback
      }
    }
    if (onChange && option.id !== status) {
      onChange(option.id);
    }
  };

  return (
    <div className="status-badge-container" ref={dropdownRef}>
      <button
        type="button"
        className={`status-badge status-${currentOption.colorVar} ${interactive ? 'interactive' : ''}`}
        onClick={() => interactive && setIsOpen(!isOpen)}
        title={interactive ? 'Click to change status' : undefined}
      >
        <span className="status-dot" />
        <span className="status-text">{currentOption.label}</span>
        {interactive && <ChevronDown size={14} className="status-chevron" />}
      </button>

      {isOpen && (
        <div className="status-dropdown animate-fade-in">
          <div className="status-dropdown-header">Update Status</div>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`status-dropdown-item ${opt.id === status ? 'active' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <span className={`status-dot dot-${opt.colorVar}`} />
              <span className="item-label">{opt.label}</span>
              {opt.id === status && <Check size={14} className="check-icon" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
