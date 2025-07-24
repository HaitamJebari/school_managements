<script setup lang="ts">
import { ref } from 'vue';
import Revenue from '@/components/dashboards/Revenuedd.vue';
import StudentsD from '@/components/dashboards/StudentsD.vue';
import TotalS from '@/components/dashboards/TotalS.vue';
import TotalG from '@/components/dashboards/TotalG.vue';
import TeachersD from '@/components/dashboards/TeachersD.vue';

</script>

<template>
    <v-row>

        <v-col cols="12" sm="12" lg="4">
            <div class="mb-6">
                <TotalS />
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div class="mb-6">
                <TotalG/>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <Revenue />
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="12">
            <StudentsD />
        </v-col>
        <v-col cols="12" sm="12" lg="12">
            <TeachersD />
        </v-col>
        <v-col class="text-center mt-2 d-md-flex justify-md-space-between">
            <p class="text-muted">
                Design and Developed by
                <a flat variant="text" href="https://github.com/HaitamJebari" target="_blank" class="pl-1 text-primary">Haitam Jebari</a>
            </p>
        </v-col>
    </v-row>
</template>
