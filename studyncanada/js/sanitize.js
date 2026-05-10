// Input Sanitization Utility
// Protects against XSS attacks

const Sanitize = {
  // Basic HTML entity encoding
  encodeHTML: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Strip all HTML tags
  stripTags: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  },

  // Sanitize for URL
  sanitizeURL: (url) => {
    if (typeof url !== 'string') return '';
    // Only allow http, https, mailto
    const allowed = /^(https?:\/\/|mailto:)/i;
    if (!allowed.test(url)) return '';
    return encodeURI(url);
  },

  // Sanitize email
  sanitizeEmail: (email) => {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim().replace(/[<>"']/g, '');
  },

  // Sanitize phone number
  sanitizePhone: (phone) => {
    if (typeof phone !== 'string') return '';
    return phone.replace(/[^\d+\-() ]/g, '');
  },

  // Sanitize form data
  sanitizeFormData: (formData) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = Sanitize.encodeHTML(value.trim());
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  // Safe innerHTML replacement
  safeSetHTML: (element, content) => {
    if (!element) return;
    // Clear existing content
    element.textContent = '';
    // Create text node for safety
    if (typeof content === 'string') {
      element.textContent = content;
    }
  },

  // Validate and sanitize input
  validateInput: (input, type) => {
    if (typeof input !== 'string') return { valid: false, value: '' };
    
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          valid: emailRegex.test(input),
          value: Sanitize.sanitizeEmail(input)
        };
      case 'phone':
        const phoneRegex = /^[\d+\-() ]{7,20}$/;
        return {
          valid: phoneRegex.test(input),
          value: Sanitize.sanitizePhone(input)
        };
      case 'text':
        return {
          valid: input.trim().length > 0,
          value: Sanitize.encodeHTML(input.trim())
        };
      case 'url':
        const url = Sanitize.sanitizeURL(input);
        return {
          valid: url.length > 0,
          value: url
        };
      default:
        return {
          valid: true,
          value: Sanitize.encodeHTML(input)
        };
    }
  }
};

// Export
window.Sanitize = Sanitize;
