<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon } from 'vue-tabler-icons';

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;

// Example data for the number of groups by year
const groupsByYear = ref([
    { year: '2020', classA: 10, classB: 15, classC: 20 },
    { year: '2021', classA: 12, classB: 18, classC: 22 },
    { year: '2022', classA: 14, classB: 20, classC: 25 },
    { year: '2023', classA: 16, classB: 22, classC: 28 }
]);

const chartOptions = computed(() => {
    return {
        series: [
            {
                name: 'Class A',
                data: groupsByYear.value.map((group) => group.classA)
            },
            {
                name: 'Class B',
                data: groupsByYear.value.map((group) => group.classB)
            },
            {
                name: 'Class C',
                data: groupsByYear.value.map((group) => group.classC)
            }
        ],
        chartOptions: {
            grid: {
                borderColor: 'rgba(0,0,0,0.1)',
                strokeDashArray: 3,
                xaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            plotOptions: {
                bar: { horizontal: false, columnWidth: '35%', borderRadius: [8] }
            },
            colors: [primary, error, '#00E396'], // Add a third color for Class C
            chart: {
                fontFamily: 'inherit',
                type: 'bar',
                height: 360,
                offsetY: 10,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 5,
                colors: ['transparent']
            },
            xaxis: {
                type: 'category',
                categories: groupsByYear.value.map((group) => group.year),
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                labels: {
                    style: {
                        colors: '#a1aab2'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#a1aab2'
                    }
                }
            },
            fill: {
                opacity: 1,
                colors: [primary, error, '#00E396'] // Add a third color for Class C
            },
            tooltip: {
                theme: 'dark'
            },
            legend: {
                show: true // Show legend to differentiate between Class A, B, and C
            },
            responsive: [
                {
                    breakpoint: 767,
                    options: {
                        stroke: {
                            show: false,
                            width: 5,
                            colors: ['transparent']
                        }
                    }
                }
            ]
        }
    };
});
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: #0b2f9f; color: white">
                <v-card elevation="0" style="background-color: #0b2f9f; color: white">
                    <v-btn
                        icon
                        color="inherit"
                        style="
                            background-color: #0b2f9f;
                            color: white;
                            position: absolute;
                            right: 0;
                            background-color: #0b2f9f;
                            color: white;
                        "
                        flat
                    >
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card" style="">
                        <h4>Classe A</h4>
                    </div>
                    <div class="total">
                        <h1>500</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-2.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-3.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: #009990; color: white">
                <v-card elevation="0" style="background-color: #009990; color: white">
                    <v-btn icon color="inherit" style="background-color: #009990; color: white; position: absolute; right: 0" flat>
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card" style="">
                        <h4>Classe B</h4>
                    </div>
                    <div class="total">
                        <h1>600</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-5.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-6.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: black; color: white">
                <v-card elevation="0" style="background-color: black; color: white">
                    <v-btn icon color="inherit" style="background-color: black; color: white; position: absolute; right: 0" flat>
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card" style="">
                        <h4>Classe C</h4>
                    </div>
                    <div class="total">
                        <h1>700</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-7.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-8.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-9.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: #ffc93c; color: white">
                <v-card elevation="0" style="background-color: #ffc93c; color: white">
                    <v-btn icon color="inherit" style="background-color: #ffc93c; color: white; position: absolute; right: 0" flat>
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card" style="">
                        <h4>Classe A</h4>
                    </div>
                    <div class="total">
                        <h1>100</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-2.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-3.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: #47b5ff; color: white">
                <v-card elevation="0" style="background-color: #47b5ff; color: white">
                    <v-btn icon color="inherit" style="background-color: #47b5ff; color: white; position: absolute; right: 0" flat>
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card">
                        <h4>Classe B</h4>
                    </div>
                    <div class="total">
                        <h1>400</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-5.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-6.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-Card style="border-radius: 20px; height: 20vh; background-color: #5893d4; color: white">
                <v-card elevation="0" style="background-color: #5893d4; color: white">
                    <v-btn icon color="inherit" style="background-color: #5893d4; color: white; position: absolute; right: 0" flat>
                        <ArrowUpRightIcon stroke-width="1.5" size="28" class="text-grey100" />
                    </v-btn>
                    <div class="inside-card">
                        <h4>Classe B</h4>
                    </div>
                    <div class="total">
                        <h1>300</h1>
                        <div class="images">
                            <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-5.jpg" id="img2" alt="" srcset="" />
                            <img src="../../assets/images/profile/user-6.jpg" alt="" srcset="" />
                        </div>
                    </div>
                </v-card>
            </v-Card>
        </v-col>
        <v-col cols="12" sm="12" lg="6">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1 font-weight-semibold">Number of Groups by Year</h5>
                        </div>
                        <div>
                            <v-menu bottom left>
                                <template v-slot:activator="{ props }">
                                    <v-btn icon color="inherit" v-bind="props" flat>
                                        <DotsVerticalIcon stroke-width="1.5" size="24" class="text-grey100" />
                                    </v-btn>
                                </template>
                                <v-list density="compact">
                                    <v-list-item v-for="(item, i) in items" :key="i" :value="i">
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </div>

                    <v-row>
                        <v-col cols="12" class="pt-7">
                            <apexchart
                                type="bar"
                                height="370px"
                                :options="chartOptions.chartOptions"
                                :series="chartOptions.series"
                            ></apexchart>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
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
</style>
