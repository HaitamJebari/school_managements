<script setup lang="ts">
import { MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useI18n } from 'vue-i18n';
import { SettingsIcon, UserIcon } from 'vue-tabler-icons';
import { defineComponent, ref } from 'vue';
import { CalendarIcon } from 'vue-tabler-icons';
import { VCalendar } from 'vuetify/labs/VCalendar';
import { ScheduleXCalendar } from '@schedule-x/vue';
import { createCalendar, createViewDay, createViewMonthAgenda, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';

// Do not use a ref here, as the calendar instance is not reactive, and doing so might cause issues
// For updating events, use the events service plugin
const calendarApp = createCalendar({
    selectedDate: '2023-12-19',
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: [
        {
            id: 1,
            title: 'Event 1',
            start: '2023-12-19',
            end: '2023-12-19'
        },
        {
            id: 2,
            title: 'Event 2',
            start: '2023-12-20 12:00',
            end: '2023-12-20 13:00'
        }
    ]
});

// Access the Vue I18n instance
const { locale, t } = useI18n();

// Function to change the language
const changeLanguage = (lang: string) => {
    locale.value = lang;
};

const isOpened = ref(false);
const languages = ref([
    { code: 'en', name: 'English', flag: 'fi-us' },
    { code: 'fr', name: 'Français', flag: 'fi-fr' }
    // { code: 'de', name: 'Deutsch', flag: 'fi-de' },
    // { code: 'es', name: 'Español', flag: 'fi-es' }
]);
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
  <template v-slot:activator="{ props }">
    <div class="language-calendar-wrapper" v-bind="props">
      
      <!-- Language Buttons -->
      <v-btn
        v-for="lang in languages"
        :key="lang.code"
        size="small"
        class="circle-button"
        :class="{ 'selected-language': locale === lang.code }"
        color="primary"
        flat
        @click="changeLanguage(lang.code)"
      >
        <span :class="['fi', lang.flag]"></span>
      </v-btn>

      <!-- Calendar Button -->
      <v-btn
        icon
        color="inherit"
        flat
        @click="isOpened = true"
      >
        <CalendarIcon stroke-width="1.5" size="24" class="text-black" />
      </v-btn>

    </div>

    <!-- Calendar Panel -->
    <VueSidePanel v-model="isOpened" lock-scroll width="600px">
      <div>
        <ScheduleXCalendar :calendar-app="calendarApp" />
      </div>
    </VueSidePanel>
  </template>
</v-menu>

</template>

<style scoped>
.language-calendar-wrapper {
    display: flex;
    align-items: center;
    gap: 10px; 
}

.circle-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.circle-button .fi {
    font-size: 20px;
}
.selected-language {
    transform: scale(1.1);
    border: 1px solid #1976d2; 
}
</style>
