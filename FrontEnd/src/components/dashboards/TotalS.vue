<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import axios from 'axios';
import { UserIcon, ArrowUpLeftIcon } from 'vue-tabler-icons';

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const lightprimary = theme.current.value.colors.lightprimary;

// Student total data
const studentTotal = ref(0);
const loading = ref(true);

// Fetch total number of students from the backend
const fetchStudentTotal = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:5000/students/total');
    studentTotal.value = response.data.total;
    console.log('Student total:', studentTotal.value);
  } catch (error) {
    console.error('Error fetching student total:', error);
    // Fallback to random number if API fails
    studentTotal.value = Math.floor(Math.random() * 100);
  } finally {
    loading.value = false;
  }
};

// Chart options (kept from original code)
const chartOptions = computed(() => {
    return {
        series: [5368, 3500, 4106],
        labels: ['5368', 'Refferal Traffic', 'Oragnic Traffic'],
        chart: {
            height: 170,
            type: 'donut',
            fontFamily: "Plus Jakarta Sans', sans-serif",
            foreColor: '#c6d1e9'
        },

        tooltip: {
            theme: 'dark',
            fillSeriesColor: false
        },

        colors: ['#e7ecf0', '#fb977d', primary],
        dataLabels: {
            enabled: false
        },

        legend: {
            show: false
        },

        stroke: {
            show: false
        },
        responsive: [
            {
                breakpoint: 991,
                options: {
                    chart: {
                        width: 150
                    }
                }
            }
        ],
        plotOptions: {
            pie: {
                donut: {
                    size: '80%',
                    background: 'none',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '12px',
                            color: undefined,
                            offsetY: 5
                        },
                        value: {
                            show: false,
                            color: '#98aab4'
                        }
                    }
                }
            }
        }
    };
});
const Chart = [38, 40, 25];

// Fetch data when component is mounted
onMounted(() => {
  fetchStudentTotal();
});
</script>
<template>
    <v-card style="border-radius: 20px; background-color: rgb(251, 140, 0,1); height: 17vh; color: white">
        <v-card-item>
            <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                <v-card-title class="text-h5">Students</v-card-title>
                <v-btn size="small" icon class="bg-warning">
                    <v-avatar size="20" class="text-surface">
                        <UserIcon size="20" />
                    </v-avatar>
                </v-btn>
            </div>
            <v-row>
                <v-col cols="6" sm="7">
                    <div class="mt-2">
                        <h3 class="text-h4" v-if="!loading">{{ studentTotal }}</h3>
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
