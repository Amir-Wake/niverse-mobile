import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const i18n = new I18n({
  en: { welcome: 'Hello', home: 'Home', library: 'Library', profile: 'Profile',
    By: 'By',
    accountDetails: 'Account Details', updatePassword: 'Update Password', emailNotifications: 'Email Notifications', contact: 'Contact and Support',
    ageRestriction: 'Age Restriction', language: 'Language', privacyPolicy: 'Privacy Policy', terms: 'Terms and Conditions', faqs: 'FAQs', signOut: 'Sign Out',
   },
  ku: { welcome: 'بەخێربێیت', home: 'ماڵەوە', library: 'کتێبخانە', profile: 'پرۆفایل',
    By: 'لەلایەن',
    accountDetails: 'زانیارییەکانی هەژمار', updatePassword: 'نوێکردنەوەی تێپەڕ', emailNotifications: 'ئاگادارییەکانی ئیمەیل', contact: 'پەیوەندی و پشتگیری',
    ageRestriction: 'تەمەنی دیاریکراو', language: 'زمان', privacyPolicy: 'چاودێری و تایبەتی', terms: 'مەرج و ڕێکخراوەکان', faqs: 'پرسیار و وەڵام', signOut: 'دەرچوون',
   },
  ar: { welcome: 'مرحبا', home: 'الصفحة الرئيسية', library: 'مكتبة', profile: 'الملف الشخصي',
    By: 'بواسطة',
    accountDetails: 'تفاصيل الحساب', updatePassword: 'تحديث كلمة المرور', emailNotifications: 'إشعارات البريد الإلكتروني', contact: 'اتصل بنا',
    ageRestriction: 'قيود العمر', language: 'لغة', privacyPolicy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', faqs: 'الأسئلة الشائعة', signOut: 'خروج',
   },
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

// Load the saved language when the app starts
(async () => {
  await getLanguage();
})();

export default i18n;
