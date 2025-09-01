import { createI18n } from 'vue-i18n';

// Define your translations
const messages = {
  en: {
    welcome: 'Welcome',
    students: 'Students',
    teachers: 'Teachers',
    tableHeaders: {
      id: 'Id',
      firstName: 'First Name',
      lastName: 'Last Name',
      
    },
    sidebar: {
      // teachers: 'Teachers',
      Students: 'Students',

    }
  },
  fr: {
    welcome: 'Bienvenue',
    students: 'Étudiants',
    teachers: 'Enseignants',
    tableHeaders: {
      id: 'Identifiant',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
    },
    sidebar: {
      // dashboard:'Dash',
      // teachers: 'Enseignants',
      Students: 'Étudiants',

    }
  },
};

// Create an instance of Vue I18n
const i18n = createI18n({
  locale: 'en', // Default language
  fallbackLocale: 'en', // Fallback language
  messages,
});

export default i18n;
