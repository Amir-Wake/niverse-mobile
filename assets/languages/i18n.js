import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const i18n = new I18n({
  en: { welcome: 'Hello', home: 'Home', library: 'Library', profile: 'Profile' },
  ku: { welcome: 'بەخێربێیت', home: 'ماڵ', library: 'کتێبخانە', profile: 'پرۆفایل' },
  ar: { welcome: 'مرحبا', home: 'الصفحة الرئيسية', library: 'مكتبة', profile: 'الملف الشخصي' },
});

export const setLanguage = async (language) => {
  i18n.locale = language;
  await AsyncStorage.setItem('selectedLanguage', language);
};

export const getLanguage = async () => {
  const language = await AsyncStorage.getItem('selectedLanguage');
  if (language) {
    i18n.locale = language;
    return language;
  } else {
    i18n.locale = 'en';
    return 'en';
  }
};

export default i18n;
