import { createApp } from 'vue';
import { createPinia } from 'pinia';
// import Modal from "@burhanahmeed/vue-modal-2";
// import Vue from "vue";
import App from './App.vue';
import { router } from './router';
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Import Vuetify styles
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import Maska from 'maska';
import { createI18n } from 'vue-i18n';
import VueSidePanel from 'vue3-side-panel';
import 'vue3-side-panel/dist/vue3-side-panel.css'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// Import Bootstrap and BootstrapVue 3 styles
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import BootstrapVue3 from 'bootstrap-vue-3';
import { VCalendar } from 'vuetify/labs/VCalendar';





// Translation messages with sidebar section
const messages = {
  en: {
    Students: "Students",
    Id: "Id",
    "First Name": "First Name",
    "Last Name": "Last Name",
    Parent: "Parent",
    "Parent Tel": "Parent Tel",
    Adresse: "Address",
    Email: "Email",
    Age: "Age",
    "Inscription Date": "Inscription Date",
    Price: "Price",
    sidebar: {
      // dashboard:'Dashboard',
      // teachers: 'Teachers',
      Students: "Students",
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
    Dashboard:"Panel",
    Students: "Étudiants",
    Id: "Id",
    "First Name": "Prénom",
    "Last Name": "Nom de famille",
    Parent: "Parent",
    "Parent Tel": "Téléphone du parent",
    Adresse: "Adresse",
    Email: "Email",
    Age: "Âge",
    "Inscription Date": "Date d'inscription",
    Price: "Prix",
    sidebar: {
      // teachers: 'Enseignants',
      Students: "Étudiants",
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
  }
};
// //popup
// Vue.use(Modal);

// Vue.config.productionTip = false;

// new Vue({
//   render: (h) => h(App)
// }).$mount("#app");
const vuetify = createVuetify({
  components: {
    VCalendar, 
  },
});

// Create Vue I18n instance
const i18n = createI18n({
  locale: 'en', // Default language
  fallbackLocale: 'en', // Fallback language
  messages, // Translation messages
});
const app = createApp(App);
app.use(VueApexCharts);
app.use(ElementPlus);
app.use(VueSidePanel);
app.use(BootstrapVue3);
app.use(i18n); // Use Vue I18n instance
app.use(router);
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Maska);
app.use(VueApexCharts);
app.use(vuetify).mount('#app');
