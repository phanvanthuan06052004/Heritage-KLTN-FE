import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export const useLanguage = () => {
  const { i18n } = useTranslation()
  
  return {
    language: i18n.language || 'vi',
    changeLanguage: (lang) => i18n.changeLanguage(lang)
  }
}

/**
 * lắng nghe sự thay đổi ngôn ngữ
 * callback được gọi khi ngôn ngữ thay đổi
 * @param {Function} callback 
 */
export const useLanguageChange = (callback) => {
  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (callback) {
        callback(event.detail.language)
      }
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [callback])
}

