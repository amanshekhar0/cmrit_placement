/**
 * Safely escapes special regex characters in a string
 * to prevent Regex Injection and ReDoS attacks.
 * 
 * @param {string} string - The input string to escape
 * @returns {string} The escaped string safe for new RegExp()
 */
function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

module.exports = escapeRegex;
