import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueSidePanel from 'vue3-side-panel';
import 'vue3-side-panel/dist/vue3-side-panel.css'
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import BootstrapVue3 from 'bootstrap-vue-3';
import Maska from 'maska';
import i18n from './i18n';
import { Slide } from 'vue-burger-menu' 

const app = createApp(App);
export default {
    components: {
        Slide // Register your component
    }
};

app.use(router);
app.use(i18n); // Use Vue I18n instance
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Maska);
app.use(VueApexCharts);
app.use(ElementPlus);
app.use(vuetify).mount('#app');
app.use(VueSidePanel);
app.use(BootstrapVue3);



