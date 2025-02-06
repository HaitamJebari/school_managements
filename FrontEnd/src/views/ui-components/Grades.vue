<script setup lang="ts">
import { ref } from 'vue';

import Grades from '@/components/dashboards/Grades.vue';


</script>

<template>
    <v-row>
        <v-col cols="12" sm="8" lg="12">
            <Grades />
        </v-col>
    </v-row>
</template>