<script setup lang="ts">
import { MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useI18n } from 'vue-i18n';
import { SettingsIcon, UserIcon } from 'vue-tabler-icons';
import { defineComponent, ref } from 'vue';
import { CalendarIcon } from 'vue-tabler-icons';
import { VCalendar } from 'vuetify/labs/VCalendar';
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
 
// Do not use a ref here, as the calendar instance is not reactive, and doing so might cause issues
// For updating events, use the events service plugin
const calendarApp = createCalendar({
  selectedDate: '2023-12-19',
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonthGrid(),
    createViewMonthAgenda(),
  ],
  events: [
    {
      id: 1,
      title: 'Event 1',
      start: '2023-12-19',
      end: '2023-12-19',
    },
    {
      id: 2,
      title: 'Event 2',
      start: '2023-12-20 12:00',
      end: '2023-12-20 13:00',
    },
  ],
})

// Access the Vue I18n instance
const { locale, t } = useI18n();

// Function to change the language
const changeLanguage = (lang: string) => {
    locale.value = lang;
};

const isOpened = ref(false);
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn size="small" class="circle-button" color="primary" style="margin-right: 15px" flat @click="changeLanguage('en')">
                English
            </v-btn>
            <v-btn size="small" class="circle-button" color="primary" style="margin-right: 15px" flat @click="changeLanguage('fr')">
                Français
            </v-btn>
            <v-btn icon color="inherit" flat>
                <SettingsIcon stroke-width="1.5" size="24" class="text-grey100" />
            </v-btn>
            <v-btn class="" variant="text" v-bind="props" icon>
                <UserIcon stroke-width="1.5" size="24" class="text-grey100" />
            </v-btn>
            <v-btn icon color="inherit" flat @click="isOpened = true">
                <CalendarIcon stroke-width="1.5" size="24" class="text-grey100" />
            </v-btn>

            <VueSidePanel v-model="isOpened" lock-scroll width="600px">
                <div>
                    <ScheduleXCalendar :calendar-app="calendarApp" />   
                </div>
            </VueSidePanel>
        </template>
        <v-sheet rounded="xl" width="200" elevation="10" class="mt-2">
            <v-list class="py-0" lines="one" density="compact">
                <v-list-item value="item1" color="primary">
                    <v-list-item-title class="pl-4 text-body-1">My Profile</v-list-item-title>
                </v-list-item>
                <v-list-item value="item2" color="primary">
                    <template v-slot:prepend>
                        <MailIcon stroke-width="1.5" size="20" />
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Account</v-list-item-title>
                </v-list-item>
                <v-list-item value="item3" color="primary">
                    <template v-slot:prepend>
                        <ListCheckIcon stroke-width="1.5" size="20" />
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Task</v-list-item-title>
                </v-list-item>
            </v-list>
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn to="" color="primary" variant="outlined" class="rounded-pill" block>Logout</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>
<style scoped>
.circle-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.circle-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
</style>
