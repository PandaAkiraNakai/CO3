import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../../languages/en.json';

const resources = {
  en: { translation: en },
  // es: { translation: es },
};

const getSavedLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem('app_language');
    return savedLang || 'en';
  } catch (e) {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = async lng => {
  await AsyncStorage.setItem('app_language', lng);
  await i18n.changeLanguage(lng);
};

export default i18n;
