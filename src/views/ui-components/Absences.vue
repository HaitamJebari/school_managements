<script setup lang="ts">
import { ref } from 'vue';

import Absences from '@/components/dashboards/Absences.vue';


</script>

<template>
    <v-row>
        <v-col cols="12" sm="8" lg="12">
            <Absences />
        </v-col>
    </v-row>
</template>