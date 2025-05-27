<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import axios from 'axios';
import { UsersIcon, ArrowUpLeftIcon } from 'vue-tabler-icons';

const theme = useTheme();
const indigo = theme.current.value.colors.indigo;

// Group total data
const groupTotal = ref(0);
const loading = ref(true);

// Fetch total number of groups from the backend
const fetchGroupTotal = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:5000/groups/total');
    groupTotal.value = response.data.total;
    console.log('Group total:', groupTotal.value);
  } catch (error) {
    console.error('Error fetching group total:', error);
    // Fallback to random number if API fails
    groupTotal.value = Math.floor(Math.random() * 100);
  } finally {
    loading.value = false;
  }
};

/* Chart */
const areachartOptions = computed(() => {
    return {
        chart: {
            id: 'sparkline3',
            type: 'area',
            height: 60,
            sparkline: {
                enabled: true
            },
            group: 'sparklines',
            fontFamily: 'inherit',
            foreColor: '#adb0bb'
        },
        series: [
            {
                name: 'Earnings',
                color: '#8763da',
                data: [25, 66, 20, 40, 12, 58, 20]
            }
        ],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            colors: ['#f3feff'],
            type: 'solid',
            opacity: 0.05
        },

        markers: {
            size: 0
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: true,
                position: 'right'
            },
            x: {
                show: false
            }
        }
    };
});

const areaChart = {
    series: [
        {
            name: '',
            data: [25, 66, 20, 40, 12, 58, 20]
        }
    ]
};

// Fetch data when component is mounted
onMounted(() => {
  fetchGroupTotal();
});
</script>
<template>
    <v-card style="border-radius: 20px; background-color: #2196f3; height: 17vh; color: white">
        <v-card-item>
            <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                <v-card-title class="text-h5">Groups</v-card-title>
                <v-btn size="small" icon class="bg-info">
                    <v-avatar size="20" class="text-surface">
                        <UsersIcon size="20" />
                    </v-avatar>
                </v-btn>
            </div>
            <v-row>
                <v-col cols="6" sm="7">
                    <div class="mt-2">
                        <h3 class="text-h4" v-if="!loading">{{ groupTotal }}</h3>
                        <h3 class="text-h4" v-else>Loading...</h3>
                        <div class="mt-2">
                            <v-avatar class="bg-lightsuccess text-success" size="20">
                                <ArrowUpLeftIcon size="15" />
                            </v-avatar>
                            <span class="text-subtitle-2 ml-2 font-weight-bold">+{{ Math.floor(Math.random() * 20) }}%</span>
                            <span class="text-subtitle-2 font-weight-bold ml-2">last year</span>
                        </div>
                        
                    </div>
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
</template>
<style scoped>
.images {
    width: 50px;
    height: 50px;
    display: flex;
    border-radius: 50%;
}
img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px white solid;
}
#img2 {
    margin: 0 -12px 0 -12px;
}
h1 {
    font-size: 2em;
    font-weight: bold;
    font-family: 'Poppins', sans-serif;
}
h4 {
    font-family: 'Poppins', sans-serif;
}
.inside-card {
    padding: 1em;
}
.total {
    display: flex;
    gap: 150px;
    padding: 2em;
    transform: translateY(20%);
}
.bg-lightsuccess {
    background-color: rgba(76, 175, 80, 0.2);
}
.text-success {
    color: #4CAF50;
}
</style>
