import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, MapPin, Star, MessageSquare, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { STATUS_OPTIONS } from './StatusBadge';

const PRESET_CATEGORIES = [
  'Healthcare & Dental',
  'Café & Restaurant',
  'Real Estate',
  'Home Services',
  'Fitness & Gym',
  'Beauty & Wellness',
  'Automotive',
  'Legal & Consulting',
  'Retail Store'
];

export const LeadModal = ({ isOpen, onClose, onSave, leadToEdit = null }) => {
  const [formData, setFormData] = useState({
    business_name: '',
    type: '',
    contact_number: '',
    location: '',
    google_rating: '4.5',
    google_reviews_count: '25',
    status: 'New',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        business_name: leadToEdit.business_name || '',
        type: leadToEdit.type || '',
        contact_number: leadToEdit.contact_number || '',
        location: leadToEdit.location || '',
        google_rating: leadToEdit.google_rating?.toString() || '4.5',
        google_reviews_count: leadToEdit.google_reviews_count?.toString() || '0',
        status: leadToEdit.status || 'New',
        notes: leadToEdit.notes || ''
      });
    } else {
      setFormData({
        business_name: '',
        type: '',
        contact_number: '',
        location: '',
        google_rating: '4.5',
        google_reviews_count: '25',
        status: 'New',
        notes: ''
      });
    }
    setErrors({});
    setServerError('');
    setIsSubmitting(false);
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.business_name.trim()) errs.business_name = 'Business name is required';
    if (!formData.contact_number.trim()) errs.contact_number = 'Contact number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await onSave({
        ...formData,
        google_rating: parseFloat(formData.google_rating) || 0,
        google_reviews_count: parseInt(formData.google_reviews_count, 10) || 0
      });

      if (res && res.success === false) {
        setServerError(res.message || 'Duplicate lead detected.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setServerError('An unexpected error occurred: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {leadToEdit ? 'Edit Lead Details' : 'Add New Business Lead'}
            </h2>
            <p className="modal-subtitle">
              {leadToEdit 
                ? 'Update contact information and status' 
                : 'Enter company details to start tracking outreach (duplicate phone & names are rejected)'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-fields-scroll">
            {/* Duplicate / Rejection Error Banner */}
            {serverError && (
              <div className="error-box animate-fade-in">
                <AlertCircle size={18} className="error-icon" />
                <div className="error-content">
                  <strong>Insertion Rejected</strong>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            {/* Business Name */}
            <div className="form-group">
              <label className="form-label">
                <Building2 size={15} className="label-icon" />
                Business Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.business_name ? 'input-error' : ''}`}
                placeholder="e.g. Apex Dental Care"
                value={formData.business_name}
                onChange={(e) => {
                  setFormData({ ...formData, business_name: e.target.value });
                  setServerError('');
                }}
                autoFocus
              />
              {errors.business_name && <span className="error-text">{errors.business_name}</span>}
            </div>

            {/* Business Category / Type */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={15} className="label-icon" />
                Business Type / Industry
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Healthcare, Restaurant, Plumbing"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              {/* Quick Preset Badges */}
              <div className="preset-categories-row">
                {PRESET_CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`preset-pill ${formData.type === cat ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Number & Location Grid */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} className="label-icon" />
                  Contact Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.contact_number ? 'input-error' : ''}`}
                  placeholder="+91 98765 43210"
                  value={formData.contact_number}
                  onChange={(e) => {
                    setFormData({ ...formData, contact_number: e.target.value });
                    setServerError('');
                  }}
                />
                {errors.contact_number && <span className="error-text">{errors.contact_number}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} className="label-icon" />
                  Location / City
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Koramangala, Bengaluru"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Google Rating & Reviews Count Grid */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <Star size={15} className="label-icon rating-color" />
                  Google Rating (0.0 - 5.0)
                </label>
                <div className="rating-input-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input"
                    placeholder="4.8"
                    value={formData.google_rating}
                    onChange={(e) => setFormData({ ...formData, google_rating: e.target.value })}
                  />
                  <span className="rating-star-affix">⭐</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Google Review Count
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="150"
                  value={formData.google_reviews_count}
                  onChange={(e) => setFormData({ ...formData, google_reviews_count: e.target.value })}
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="form-group">
              <label className="form-label">
                <CheckCircle2 size={15} className="label-icon" />
                Current Outreach Status
              </label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                <MessageSquare size={15} className="label-icon" />
                Notes / Key Details
              </label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Call notes, follow-up times, or specific requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : leadToEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
