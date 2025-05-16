<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon } from 'vue-tabler-icons';
import { defineComponent } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const series = ref([44, 55]);

const chartOptionss = ref({
    chart: {
        type: 'donut'
    },
    labels: ['Males', 'Females'], // Set labels for the donut
    plotOptions: {
        pie: {
            startAngle: -90,
            endAngle: 270
        }
    },
    dataLabels: {
        enabled: true // Enable data labels for better visibility
    },
    fill: {
        type: 'gradient'
    },
    legend: {
        formatter: (val, opts) => {
            return `${val} - ${opts.w.globals.series[opts.seriesIndex]}`;
        }
    },
    title: {
        text: 'Total of Male and Female Students'
    },
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    ]
});

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;

// Example data for the number of groups by year
const groupsByYear = ref([
    { year: '2020', classA: 10, classB: 15, classC: 20 },
    { year: '2021', classA: 12, classB: 18, classC: 22 },
    { year: '2022', classA: 14, classB: 20, classC: 25 },
    { year: '2023', classA: 16, classB: 22, classC: 30 },
    { year: '2024', classA: 16, classB: 22, classC: 30 }
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





//delete Group
// const showConfirmationDialog = (classesId: number) => {
//     const swalWithBootstrapButtons = Swal.mixin({
//         customClass: {
//             confirmButton: 'btn btn-success mx-2',
//             cancelButton: 'btn btn-danger mx-2'
//         },
//         buttonsStyling: false
//     });

//     swalWithBootstrapButtons
//         .fire({
//             title: 'Are you sure?',
//             text: 'This action cannot be undone!',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Yes, delete it!',
//             cancelButtonText: 'No, cancel!',
//             reverseButtons: true
//         })
//         .then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const response = await axios.delete(`http://localhost:5000/classes/${classesId}`);
//                     if (response.status === 200) {
//                         swalWithBootstrapButtons.fire({
//                             title: 'Deleted!',
//                             text: 'The student has been deleted successfully.',
//                             icon: 'success',
//                             confirmButtonText: 'OK'
//                         });
//                         // Update the local list of class
//                         classes.value = classes.value.filter((classes) => classes.id !== classesId);
//                     } else {
//                         swalWithBootstrapButtons.fire({
//                             title: 'Failed!',
//                             text: 'Failed to delete the teacher.',
//                             icon: 'error',
//                             confirmButtonText: 'OK',
//                             customClass: {
//                                 confirmButton: 'btn btn-danger'
//                             }
//                         });
//                     }
//                 } catch (error) {
//                     swalWithBootstrapButtons.fire({
//                         title: 'Error!',
//                         text: 'Something went wrong during deletion.',
//                         icon: 'error',
//                         confirmButtonText: 'OK',
//                         customClass: {
//                             confirmButton: 'btn btn-danger'
//                         }
//                     });
//                 }
//             } else if (result.dismiss === Swal.DismissReason.cancel) {
//                 swalWithBootstrapButtons.fire({
//                     title: 'Cancelled',
//                     icon: 'info',
//                     confirmButtonText: 'OK',
//                     customClass: {
//                         confirmButton: 'btn btn-info    '
//                     }
//                 });
//             }
//         });
// };
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
                        <h4>Group A</h4>
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
                        <h4>Group B</h4>
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
                        <h4>Group C</h4>
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
                        <h4>Group A</h4>
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
                    <!-- <v-btn
                        :style="{ backgroundColor: classItem.bgColor }"
                        icon
                        @click="showConfirmationDialog(classItem.id)"
                        style="position: absolute; right: 10px; top: 10px; z-index: 10"
                    > -->
                        <TrashIcon stroke-width="1.5" size="24" />
                    <!-- </v-btn> -->
                    <div class="inside-card">
                        <h4>Group B</h4>
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
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card class="d-flex align-center justify-center" style="height: 10vh; width: 10vh; border-radius: 50%">
                <v-btn icon color="white" @click="openPopup" size="80" flat>
                    <PlusIcon stroke-width="1.5" size="60" style="color: grey" />
                </v-btn>
            </v-card>
        </v-col>
        <v-col cols="12" sm="12" lg="6">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1 font-weight-semibold">Number of Group by Year</h5>
                        </div>
                        <div>
                            <v-menu bottom left>
                                <v-list density="compact">
                                    <v-list-item v-for="(item, i) in items" :key="i" :value="i">
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </div>

                    <v-row>
                        <v-col cols="12">
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
        <v-col cols="12" sm="12" lg="6">
            <v-card elevation="10" style="border-radius: 20px; max-width: 100%; padding: 30px 20px 20px 20px; height: 100%">
                <div>
                    <apexchart
                        style="transform: translate(10%, 10%)"
                        type="donut"
                        :options="chartOptionss"
                        :series="series"
                        width="500"
                    ></apexchart>
                </div>
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
