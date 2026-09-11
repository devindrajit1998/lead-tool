/**
 * Clean phone number for tel: and wa.me links
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove spaces, dashes, brackets
  return phone.replace(/[^0-9+]/g, '');
};

/**
 * Format phone for wa.me link (must NOT contain + or spaces)
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned;
};

/**
 * Generate WhatsApp chat URL with optional customized message
 */
export const getWhatsAppUrl = (phone, businessName = '') => {
  const number = formatWhatsAppNumber(phone);
  if (!number) return '#';
  const defaultText = businessName 
    ? `Hi ${businessName}, I would like to discuss a business proposal.`
    : `Hi, I would like to get in touch.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(defaultText)}`;
};

/**
 * Generate Direct Call URL
 */
export const getDirectCallUrl = (phone) => {
  const cleaned = cleanPhoneNumber(phone);
  return cleaned ? `tel:${cleaned}` : '#';
};

/**
 * Format relative time (e.g., '2 hours ago', 'Just now')
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};
