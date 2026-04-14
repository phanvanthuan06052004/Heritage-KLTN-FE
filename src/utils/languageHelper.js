/**
 * Helper function to get current language from localStorage
 * @returns {string} Current language code ('vi' or 'en')
 */
export const getCurrentLanguage = () => {
  return localStorage.getItem('lang') || 'vi'
}

/**
 * Helper function to set current language to localStorage
 * @param {string} language - Language code to set
 */
export const setCurrentLanguage = (language) => {
  localStorage.setItem('lang', language)
}

/**
 * Helper function to check if a language is valid
 * @param {string} language - Language code to check
 * @returns {boolean} True if language is valid
 */
export const isValidLanguage = (language) => {
  return ['vi', 'en'].includes(language)
}

