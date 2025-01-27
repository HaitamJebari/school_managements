import { createI18n } from 'vue-i18n';

// Define your translations
const messages = {
  en: {
    welcome: 'Welcome',
    students: 'Students',
    tableHeaders: {
      id: 'Id',
      firstName: 'First Name',
      lastName: 'Last Name',
    },
    sidebar: {
      // dashboard:'Dashboard',
      // teachers: 'Teachers',
      Students: 'Students',
      // classes: 'Classes',
      // modules: 'Modules',
      // groups: 'Groups',
      // schedules: 'Schedules',
      // absences: 'Absences',
      // exams: 'Exams',
      // grades: 'Grades',
      // revenue: 'Revenue',
      // results: 'Results',
      // announcements: 'Announcements',
    }
  },
  fr: {
    welcome: 'Bienvenue',
    students: 'Étudiants',
    tableHeaders: {
      id: 'Identifiant',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
    },
    sidebar: {
      // dashboard:'Dash',
      // teachers: 'Enseignants',
      Students: 'Étudiants',
      // classes: 'Classes',
      // modules: 'Modules',
      // groups: 'Groupes',
      // schedules: 'Horaires',
      // absences: 'Absences',
      // exams: 'Examens',
      // grades: 'Notes',
      // revenue: 'Revenu',
      // results: 'Résultats',
      // announcements: 'Annonces',
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
