import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const i18n = new I18n({
  en: { welcome: 'Hello', home: 'Home', library: 'Library', profile: 'Profile',
    By: 'By', read: 'Read', download: 'Download', wantToRead: 'Want To Read', pages: 'Pages', publicationDate: 'Publication Date', publisher: 'Publisher', translator: 'Translator', ageRating: 'Age Rating',
    accountDetails: 'Account Details', updatePassword: 'Update Password', emailNotifications: 'Email Notifications', contact: 'Contact and Support',
    ageRestriction: 'Age Restriction', language: 'Language', privacyPolicy: 'Privacy Policy', terms: 'Terms and Conditions', faqs: 'FAQs', signOut: 'Sign Out',
    email: 'Email', password: 'Password', confirmPassword: 'Confirm Password', currentPassword: 'Current Password', name: 'Name', birthday: 'Birthday', saveChanges: 'Save Changes', selectLanguage: 'Select Language', newPass: 'New Password',
    collections: 'Collections', downloaded: 'Downloaded',
    search: 'Search', bookmarks: 'Bookmarks', content: 'Content', theme: 'Theme', font: 'Font', increase: 'Increase', decrease: 'Decrease',
    signIn: 'Sign In', signUp: 'Sign Up', forgotPassword: 'Forgot your password?', signInText: 'Log in with your email and password', signUpText: 'Sign up with your email and password',
   },
  ku: { welcome: 'بەخێربێیت', home: 'ماڵەوە', library: 'کتێبخانە', profile: 'پرۆفایل',
    By: 'لەلایەن', read: 'خوێندنەوە', download: 'داگرتن', wantToRead: 'دەتەوێت بیخوێنیت', pages: 'پەڕەکان', publicationDate: 'بەرواری چاپکردن', publisher: 'چاپخانە', translator: 'وەرگێر', ageRating: 'پێویستی تەمەن',
    accountDetails: 'زانیارییەکانی هەژمار', updatePassword: 'نوێکردنەوەی تێپەڕ', emailNotifications: 'ئاگادارییەکانی ئیمەیل', contact: 'پەیوەندی و پشتگیری',
    ageRestriction: 'تەمەنی دیاریکراو', language: 'زمان', privacyPolicy: 'چاودێری و تایبەتی', terms: 'مەرج و ڕێکخراوەکان', faqs: 'پرسیار و وەڵام', signOut: 'دەرچوون',
    email: 'ئیمەیل', password: 'تێپەڕ', confirmPassword: 'دووبارە تێپەڕی نوێ', currentPassword: 'تێپەڕی ئێستا',currentPassword: 'تێپەڕی ئێستا', name: 'ناو', birthday: 'ڕۆژی لەدایکبوون', saveChanges: 'پاشەکەوتکردن', selectLanguage: 'زمانی دیاریکراو', newPass: 'تێپەڕی نوێ',
    collections: 'کۆکراوەکان', downloaded: 'داگرتوو',
    search: 'گەڕان', bookmarks: 'نیشانگە', content: 'ناوەڕۆک', theme: 'ڕووکار', font: 'فۆنت', increase: 'گەورەکردن', decrease: 'بچوککردن',
    signIn: 'چوونە ژوور', signUp: 'خۆ تۆمارکردن', forgotPassword: 'تێپەڕەکەت لەبیرکردووە؟', signInText: 'چوونە ژوور بە ئیمەیل و تێپەڕ', signUpText: 'خۆ تۆمارکردن بە ئیمەیل و تێپەڕ',
   },
  ar: { welcome: 'مرحبا', home: 'الصفحة الرئيسية', library: 'مكتبة', profile: 'الملف الشخصي',
    By: 'بواسطة', read: 'قراءة', download: 'تحميل', wantToRead: 'أريد قراءة', pages: 'صفحات', publicationDate: 'تاريخ النشر', publisher: 'الناشر', translator: 'المترجم', ageRating: 'تصنيف العمر',
    accountDetails: 'تفاصيل الحساب', updatePassword: 'تحديث كلمة المرور', emailNotifications: 'إشعارات البريد الإلكتروني', contact: 'اتصل بنا',
    ageRestriction: 'قيود العمر', language: 'لغة', privacyPolicy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', faqs: 'الأسئلة الشائعة', signOut: 'خروج',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور', currentPassword: 'كلمة المرور الحالية', name: 'الاسم', birthday: 'تاريخ الميلاد', saveChanges: 'حفظ', selectLanguage: 'اختر اللغة', newPass: 'كلمة المرور الجديدة',
    collections: 'مجموعات', downloaded: 'تم التنزيل',
    search: 'بحث', bookmarks: 'المرجعية', content: 'محتوى', theme: 'موضوع', font: 'الخط', increase: 'زيادة', decrease: 'انخفاض',
    signIn: 'تسجيل الدخول', signUp: 'سجل', forgotPassword: 'نسيت كلمة المرور؟', signInText: 'تسجيل الدخول بالبريد الإلكتروني وكلمة المرور', signUpText: 'التسجيل بالبريد الإلكتروني وكلمة المرور',
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
    if (language === 'ku' || language === 'ar') {
      I18nManager.isRTL = true;
    } else {
      I18nManager.isRTL = false;
    }
    return language;
  } else {
    i18n.locale = 'en';
    I18nManager.isRTL = false;
    return 'en';
  }
};

(async () => {
  await getLanguage();
})();

export default i18n;
