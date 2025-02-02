import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

const i18n = new I18n({
  en: {
    welcome: "Hello",
    home: "Home",
    library: "Library",
    profile: "Profile",
    By: "By",
    read: "Read",
    download: "Download",
    wantToRead: "Want To Read",
    pages: "Pages",
    publicationDate: "Publication Date",
    publisher: "Publisher",
    translator: "Translator",
    ageRating: "Age Rating",
    accountDetails: "Account Details",
    updatePassword: "Update Password",
    emailNotifications: "Email Notifications",
    contact: "Contact",
    ageRestriction: "Age Restriction",
    language: "Languages",
    privacyPolicy: "Privacy Policy",
    terms: "Terms and Conditions",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    currentPassword: "Current Password",
    name: "Name",
    birthday: "Birthday",
    saveChanges: "Save Changes",
    selectLanguage: "Select language",
    newPass: "New Password",
    collections: "Collections",
    downloaded: "Downloaded",
    change: "Change",
    enterPassword: "Enter your password",
    passwordRequired: "Password is required",
    search: "Search",
    bookmarks: "Bookmarks",
    content: "Content",
    theme: "Theme",
    font: "Font",
    increase: "Increase",
    decrease: "Decrease",
    signIn: "Sign In",
    signUp: "Sign Up",
    forgotPassword: "Forgot your password?",
    signInText: "Log in with your email and password",
    signUpText: "Sign up with your email and password",
    searchForBooks: "Search for a book",
    deleteBook: "Delete Book",
    deleteBookText: "Are you sure you want to delete this book?",
    cancel: "Cancel",
    ok: "OK",
    success: "Success",
    profileUpdated: "Profile updated successfully",
    confirm: "Confirm",
    languageChangeText:
      "Changing the language will restart the app. Are you sure you want to continue?",
    error: "Error",
    passwordMismatch: "Passwords do not match",
    passwordLength: "Password must be at least 6 characters long",
    passwordChanged: "Password changed successfully",
    passwordIncorrect: "Current password is incorrect",
    userAgreement:
      "By continuing, you agree to our Terms of Service and Privacy Policy. Please make sure to read and understand these documents before proceeding. Your use of our service is subject to these terms and policies.",
    passwordAssistance: "Password Assistance",
    enterEmail: "Enter the email associated with your account",
    passwordAssistanceText:
      "If you forgot you password, enter your email address and we will send you a link to reset your password",
    resetPassword: "Reset Password",
    resetPasswordText:
      "An email has been sent to your email address with a link to reset your password",
    verifyEmail: "Verify your email",
    verifyEmailText:
      "An email has been sent to your email address with a link to verify your account",
    resendVerification: "Resend Verification",
    resendVerificationText:
      "If you did not receive the email, click the button above to resend it.",
    hint1: "Tip: Did you know that you can search for books by their title and author?",
    hint2: "Tip: Delete books from your library by pressing and holding on them.",
    hint4: "Tip: Add books to your collection by pressing the plus icon.",
    hint5: "Tip: Change the language for Kurdish and Arabic in the profile.",
    typeAnnotation: "Type an annotation here..",
    updateAnnotation: "Update Annotation",
    toc: "Table of Contents",
    choosePhoto: "Choose a photo",
  },
  ku: {
    welcome: "بەخێربێیت",
    home: "ماڵەوە",
    library: "کتێبخانە",
    profile: "پرۆفایل",
    By: "لەلایەن",
    read: "خوێندنەوە",
    download: "داگرتن",
    wantToRead: "دەتەوێت بیخوێنیت",
    pages: "پەڕەکان",
    publicationDate: "بەرواری چاپکردن",
    publisher: "چاپخانە",
    translator: "وەرگێر",
    ageRating: "پێویستی تەمەن",
    accountDetails: "زانیارییەکانی هەژمار",
    updatePassword: "نوێکردنەوەی تێپەڕ",
    emailNotifications: "ئاگادارییەکانی ئیمەیل",
    contact: "پەیوەندی",
    ageRestriction: "تەمەنی دیاریکراو",
    language: "زمان",
    privacyPolicy: "چاودێری و تایبەتی",
    terms: "مەرج و ڕێکخراوەکان",
    signOut: "دەرچوون",
    email: "ئیمەیل",
    password: "تێپەڕ",
    confirmPassword: "دووبارە تێپەڕی نوێ",
    currentPassword: "تێپەڕی ئێستا",
    name: "ناو",
    birthday: "ڕۆژی لەدایکبوون",
    saveChanges: "پاشەکەوتکردن",
    selectLanguage: "زمانی دیاریکراو",
    newPass: "تێپەڕی نوێ",
    collections: "کۆکراوەکان",
    downloaded: "داگرتوو",
    change: "گۆڕین",
    enterPassword: "تکایە تێپەڕەکەت بنووسە",
    passwordRequired: "تێپەڕ پێویستە",
    search: "گەڕان",
    bookmarks: "نیشانگە",
    content: "ناوەڕۆک",
    theme: "ڕووکار",
    font: "فۆنت",
    increase: "گەورەکردن",
    decrease: "بچوککردن",
    signIn: "چوونەژوورەوە",
    signUp: "خۆ تۆمارکردن",
    forgotPassword: "تێپەڕەکەت لەبیرکردووە؟",
    signInText: "چوونە ژوور بە ئیمەیل و تێپەڕ",
    signUpText: "خۆ تۆمارکردن بە ئیمەیل و تێپەڕ",
    searchForBooks: "گەڕان بۆ کتێب",
    deleteBook: "سڕینەوەی کتێب",
    deleteBookText: "دڵنیایت کە دەتەوێت ئەم کتێبە بسڕیتەوە؟",
    cancel: "پاشگەزبوون",
    ok: "باشە",
    confirm: "پشتڕاستکردن",
    languageChangeText:
      "گۆڕانکاری زمانەکە بەرنامەکە دادەخات. دڵنیایت کە دەتەوێت بیگۆڕیت؟",
    success: "سەرکەوتوو",
    profileUpdated: "پرۆفایل بە سەرکەوتوو نوێکرایەوە",
    error: "هەڵە",
    passwordMismatch: "تێپەڕەکان هاوبه‌ش نین",
    passwordLength: "تێپەڕەکە بەلایەنی ٦ پیت بێت",
    passwordChanged: "تێپەڕەکە بە سەرکەوتوویی گۆڕدرا",
    passwordIncorrect: "تێپەڕی ئێستا هەڵەیە",
    userAgreement:
      "بە بەردەوامبوون، تۆ ڕازی دەبیت بە مەرجەکانی خزمەتگوزاری و چاودێری و تایبەتی ئێمە. تکایە دڵنیابە لەوەی ئەم بەڵگەنامانە بخوێنیتەوە و تێیان بگەیت پێش  بەردەوامبوون. بەکارهێنانی خزمەتگوزارییەکەمان لەژێر ئەم مەرج و  چاودێریانەی خوارەوەدایە.",
    passwordAssistance: "یارمەتیی تێپەڕ",
    enterEmail: "ئیمەیڵەکەت بنووسە کە پەیوەستە بە هەژمارەکەتەوە",
    passwordAssistanceText:
      "ئیمەیلەکەت بنووسە و بەستەرێکت بۆ دەنێرین بۆ گەڕاندنەوەی تێپەڕەکەت",
    resetPassword: "گەڕاندنەوەی تێپەڕ",
    resetPasswordText:
      "ئیمەیلێک ناردرا بۆ ئیمەیلەکەت بە بەستەرێک بۆ نوێکردنەوەی تێپەڕ",
    verifyEmail: "پشتڕاستکردنەوەی ئیمەیل",
    verifyEmailText:
      "ئیمەیلێک ناردرا بۆ ئیمەیلەکەت بە بەستەرێک بۆ پشتڕاستکردنەوەی هەژمارەکەت",
    resendVerification: "دووبارە پشتڕاستکردنەوە",
    resendVerificationText:
      "ئەگەر ئیمەیلەت پێنەگەیشتوە، کلیک لەسەر دوگمەی سەرەوە بکە بۆ دووبارە ناردنەوە",
    hint1: "تایبەتمەندی: دەتوانیت بە ناوی کتێب و نووسەر بگەڕێیت بۆ کتێبەکان",
    hint2: "تایبەتمەندی: کتێبەکان لە کتێبخانەکەت بسڕەوە بە داگرتنی درێژ.",
    hint4: "تایبەتمەندی: کتێبەکان بۆ کۆکراوەکانت زیاد بکە بە کرتەکردن دەمەوێت بیخوێنمەوە.",
    hint5: "تایبەتمەندی: دەتوانیت زمان بگۆڕی بۆ ئینگلیزی و عەرەبی لە پرۆفایل.",
    typeAnnotation: "تێبینی بنووسە لێرە..",
    updateAnnotation: "نوێکردنەوەی تێبینی",
    toc: "ناوەڕۆک",
    choosePhoto: "وێنەیەک هەڵبژێرە",
  },
  ar: {
    welcome: "مرحبا",
    home: "الصفحة الرئيسية",
    library: "مكتبة",
    profile: "الملف الشخصي",
    By: "بواسطة",
    read: "قراءة",
    download: "تحميل",
    wantToRead: "أريد قراءة",
    pages: "صفحات",
    publicationDate: "تاريخ النشر",
    publisher: "الناشر",
    translator: "المترجم",
    ageRating: "تصنيف العمر",
    accountDetails: "تفاصيل الحساب",
    updatePassword: "تحديث كلمة المرور",
    emailNotifications: "إشعارات البريد الإلكتروني",
    contact: "اتصل بنا",
    ageRestriction: "قيود العمر",
    language: "لغة",
    privacyPolicy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    signOut: "خروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    name: "الاسم",
    birthday: "تاريخ الميلاد",
    saveChanges: "حفظ",
    selectLanguage: "اختر اللغة",
    newPass: "كلمة المرور الجديدة",
    collections: "مجموعات",
    downloaded: "تم التنزيل",
    change: "تغيير",
    enterPassword: "أدخل كلمة المرور الخاصة بك",
    passwordRequired: "كلمة المرور مطلوبة",
    search: "بحث",
    bookmarks: "المرجعية",
    content: "محتوى",
    theme: "موضوع",
    font: "الخط",
    increase: "زيادة",
    decrease: "انخفاض",
    signIn: "تسجيل الدخول",
    signUp: "سجل",
    forgotPassword: "نسيت كلمة المرور؟",
    signInText: "تسجيل الدخول بالبريد الإلكتروني وكلمة المرور",
    signUpText: "التسجيل بالبريد الإلكتروني وكلمة المرور",
    searchForBooks: "البحث عن كتاب",
    deleteBook: "حذف الكتاب",
    deleteBookText: "هل أنت متأكد أنك تريد حذف هذا الكتاب؟",
    cancel: "إلغاء",
    ok: "حسنا",
    confirm: "تأكيد",
    languageChangeText:
      "سيؤدي تغيير اللغة إلى إعادة تشغيل التطبيق. هل أنت متأكد أنك تريد المتابعة؟",
    success: "نجاح",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    error: "خطأ",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordLength: "يجب أن تكون كلمة المرور مكونة من ٦ أحرف على الأقل",
    passwordChanged: "تم تغيير كلمة المرور بنجاح",
    passwordIncorrect: "كلمة المرور الحالية غير صحيحة",
    userAgreement:
      "من خلال الاستمرار، فإنك توافق على شروط الخدمة وسياسة الخصوصية لدينا. يرجى التأكد من قراءة وفهم هذه الوثائق قبل المتابعة. استخدامك لخدمتنا يخضع لهذه الشروط والسياسات.",
    passwordAssistance: "مساعدة كلمة المرور",
    passwordAssistanceText:
      "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetPasswordText:
      "تم إرسال بريد إلكتروني إلى عنوان بريدك الإلكتروني مع رابط لإعادة تعيين كلمة المرور",
    enterEmail: "أدخل البريد الإلكتروني المرتبط بحسابك",
    verifyEmail: "تحقق من بريدك الإلكتروني",
    verifyEmailText:
      "تم إرسال بريد إلكتروني إلى عنوان بريدك الإلكتروني مع رابط للتحقق من حسابك",
    resendVerification: "إعادة إرسال التحقق",
    resendVerificationText:
      "إذا لم تستلم البريد الإلكتروني، انقر فوق الزر أعلاه لإعادة إرساله",
    hint1: "نصيحة: هل تعلم أنه يمكنك البحث عن الكتب بعنوانها والمؤلف؟",
    hint2: "نصيحة: احذف الكتب من مكتبتك بالضغط والاحتفاظ بها.",
    hint4: "نصيحة: أضف الكتب إلى مجموعتك بالضغط على رمز الزائد.",
    hint5: "نصيحة: قم بتغيير اللغة إلى الكردية والعربية في الملف الشخصي.",
    typeAnnotation: "اكتب تعليقًا هنا..",
    updateAnnotation: "تحديث التعليق",
    toc: "جدول المحتويات",
    choosePhoto: "اختر صورة",
  },
});

export const setLanguage = async (language) => {
  i18n.locale = language;
  if (language === "ku" || language === "ar") {
    I18nManager.isRTL = true;
  } else {
    I18nManager.isRTL = false;
  }
  await AsyncStorage.setItem("selectedLanguage", language);
};

export const getLanguage = async () => {
  const language = await AsyncStorage.getItem("selectedLanguage");
  if (language) {
    i18n.locale = language;
    if (language === "ku" || language === "ar") {
      I18nManager.isRTL = true;
    } else {
      I18nManager.isRTL = false;
    }
    return language;
  } else {
    i18n.locale = "en";
    I18nManager.isRTL = false;
    return "en";
  }
};

(async () => {
  await getLanguage();
})();

export default i18n;
