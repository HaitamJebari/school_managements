<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon, PlusIcon, XIcon, TrashIcon } from 'vue-tabler-icons';
import { defineComponent } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n(); // Must be called first!

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');
const loading = ref(true);

// Open popup method
const openPopup = async () => {
    showPopupp.value = true; // Show the popup
    try {
        const data = await fetchData(); // Simulated async fetch
        popupMessage.value = data;
    } catch (error) {
        popupMessage.value = 'Failed to load data.';
        console.error(error);
    }
};

// Close popup_add method
const closePopup = () => {
    showPopupp.value = false; // Close the popup
};

// Gender distribution data
const genderData = ref([]);
const series = ref([0, 0]);
const genderLabels = ref(['Males', 'Females']);

// Fetch gender distribution data
const fetchGenderDistribution = async () => {
    try {
        loading.value = true;
        const response = await axios.get('http://localhost:5000/students/gender-distribution');
        genderData.value = response.data;
        
        // Map the data to the series
        const maleCount = genderData.value.find(item => item.gender === 'male')?.count || 0;
        const femaleCount = genderData.value.find(item => item.gender === 'female')?.count || 0;
        
        series.value = [maleCount, femaleCount];
        console.log('Gender distribution:', series.value);
    } catch (error) {
        console.error('Error fetching gender distribution:', error);
        // Fallback to sample data
        series.value = [44, 55];
    } finally {
        loading.value = false;
    }
};

// Enhanced donut chart options with better visuals
const chartOptionss = computed(() => {
    const theme = useTheme();
    const primary = theme.current.value.colors.primary;
    
    return {
        chart: {
            type: 'donut',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            foreColor: '#adb0bb',
            toolbar: {
                show: false
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        colors: ['#4361ee', '#ff6384'], // Blue for males, Pink for females
        labels: genderLabels.value,
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '22px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 600,
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '16px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 400,
                            color: undefined,
                            offsetY: 16,
                            formatter: function (val) {
                                return val;
                            }
                        },
                        total: {
                            show: true,
                            showAlways: false,
                            label: 'Total',
                            fontSize: '22px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 600,
                            color: '#373d3f',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#3f51b5', '#e91e63'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            labels: {
                colors: '#adb0bb'
            },
            markers: {
                width: 10,
                height: 10,
                strokeWidth: 0,
                radius: 12,
                offsetX: -3
            },
            itemMargin: {
                horizontal: 10,
                vertical: 5
            },
            onItemClick: {
                toggleDataSeries: true
            },
            onItemHover: {
                highlightDataSeries: true
            }
        },
        tooltip: {
            theme: 'dark',
            fillSeriesColor: false,
            style: {
                fontSize: '12px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            },
            y: {
                formatter: function(value) {
                    return value + " students";
                },
                title: {
                    formatter: function (seriesName) {
                        return seriesName + ":";
                    }
                }
            }
        },
        title: {
            text: 'Student Gender Distribution',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#2b2b2b'
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        height: 280
                    },
                    legend: {
                        position: 'bottom',
                        offsetY: 5
                    }
                }
            }
        ]
    };
});

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;

// Groups by year data
const groupsByYear = ref([]);

// Fetch groups by year data
const fetchGroupsByYear = async () => {
    try {
        loading.value = true;
        const response = await axios.get('http://localhost:5000/groups/by-year');
        groupsByYear.value = response.data;
        console.log('Groups by year:', groupsByYear.value);
    } catch (error) {
        console.error('Error fetching groups by year:', error);
        // Fallback to sample data
        groupsByYear.value = [
            { year: '2020', classA: 10, classB: 15, classC: 20 },
            { year: '2021', classA: 12, classB: 18, classC: 22 },
            { year: '2022', classA: 14, classB: 20, classC: 25 },
            { year: '2023', classA: 16, classB: 22, classC: 30 },
            { year: '2024', classA: 18, classB: 24, classC: 32 }
        ];
    } finally {
        loading.value = false;
    }
};

// Enhanced bar chart options with better visuals
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
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 10
                }
            },
            plotOptions: {
                bar: { 
                    horizontal: false, 
                    columnWidth: '45%', 
                    borderRadius: 10,
                    distributed: false,
                    rangeBarOverlap: true,
                    rangeBarGroupRows: false,
                    dataLabels: {
                        position: 'top',
                        maxItems: 100,
                        hideOverflowingLabels: true
                    }
                }
            },
            colors: ['#4361ee', '#ff6384', '#33cabb'], // Blue, Pink, Teal
            chart: {
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                type: 'bar',
                height: 360,
                offsetY: 10,
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                },
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.2
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
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
                        colors: '#adb0bb',
                        fontSize: '12px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 400
                    }
                },
                title: {
                    text: 'Year',
                    offsetY: 80,
                    style: {
                        color: '#adb0bb',
                        fontSize: '14px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 500
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#adb0bb',
                        fontSize: '12px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 400
                    },
                    formatter: function (val) {
                        return val.toFixed(0);
                    }
                },
                title: {
                    text: 'Number of Groups',
                    style: {
                        color: '#adb0bb',
                        fontSize: '14px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 500
                    }
                }
            },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.2,
                    gradientToColors: undefined,
                    inverseColors: false,
                    opacityFrom: 0.85,
                    opacityTo: 0.95,
                    stops: [0, 100]
                }
            },
            tooltip: {
                theme: 'dark',
                style: {
                    fontSize: '12px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                },
                y: {
                    formatter: function (val) {
                        return val + " groups";
                    }
                },
                marker: {
                    show: false
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                labels: {
                    colors: '#adb0bb'
                },
                markers: {
                    width: 10,
                    height: 10,
                    strokeWidth: 0,
                    radius: 12,
                    offsetX: -3
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 0
                }
            },
            responsive: [
                {
                    breakpoint: 767,
                    options: {
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 6
                            }
                        },
                        legend: {
                            position: 'bottom',
                            fontSize: '12px',
                            offsetY: 0
                        }
                    }
                }
            ]
        }
    };
});

// ------------------------------------------------------Groups------------------------------------------------------

interface groupItem {
    name: string;
    number: number;
    bgColor: string;
}
const groupForm = ref<{ name: string; number: number | string }>({
    name: '',
    number: ''
});
const groups = ref<groupItem[]>([]);

const addGroup = async () => {
    try {
        const response = await axios.post('http://localhost:5000/groups', {
            name: groupForm.value.name,
            number: Number(groupForm.value.number)
        });

        // The backend now returns the group with its random color
        groups.value.push(response.data);

        Swal.fire({
            icon: 'success',
            title: 'Group added successfully!',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
        });

        groupForm.value = { name: '', number: '' };
        closePopup();
        
        // Refresh charts data
        fetchGroupsByYear();
    } catch (error) {
        console.error('Error adding group:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to add group',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    }
};

// Update fetchGroups to use backend-provided colors
const fetchGroups = async () => {
    try {
        const response = await axios.get('http://localhost:5000/groups');
        groups.value = response.data.map((cls) => ({
            ...cls,
            bgColor: cls.bgColor || cls.bg_color // Handle both cases
        }));
        console.log('Groups after fetch:', groups.value); // Debug
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
};
const submitForm = () => {
    addGroup();
};
const resetForm1 = () => {
    groupForm.value = { name: '', number: '' };
};

// Fetch data when component is mounted
onMounted(async () => {
    console.log('Fetching data...');
    await fetchGroups();
    await fetchGenderDistribution();
    await fetchGroupsByYear();
    console.log('All data fetched');
});

//delete group
const showConfirmationDialog = (groupsId: number) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success mx-2',
            cancelButton: 'btn btn-danger mx-2'
        },
        buttonsStyling: false
    });

    swalWithBootstrapButtons
        .fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        })
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://localhost:5000/groups/${groupsId}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: 'The Group has been deleted successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // Update the local list of class
                        groups.value = groups.value.filter((groups) => groups.id !== groupsId);
                        
                        // Refresh charts data
                        fetchGroupsByYear();
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: 'Failed!',
                            text: 'Failed to delete the Group.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-danger'
                            }
                        });
                    }
                } catch (error) {
                    swalWithBootstrapButtons.fire({
                        title: 'Error!',
                        text: 'Something went wrong during deletion.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-danger'
                        }
                    });
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: 'Cancelled',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-info    '
                    }
                });
            }
        });
};
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="6" class="mt-5">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1 font-weight-semibold">Number of Groups by Year</h5>
                        </div>
                        
                    </div>

                    <v-row>
                        <v-col cols="12">
                            <div v-if="loading" class="text-center py-5">
                                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                <p class="mt-2">Loading chart data...</p>
                            </div>
                            <apexchart
                                v-else
                                type="bar"
                                height="300px"
                                :options="chartOptions.chartOptions"
                                :series="chartOptions.series"
                            ></apexchart>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="12" sm="12" lg="6" class="mt-5">
            <v-card elevation="10" style="border-radius: 20px; max-width: 100%; padding: 20px; height: 100%">
                <div v-if="loading" class="text-center py-5">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="mt-2">Loading chart data...</p>
                </div>
                <div v-else>
                    <apexchart
                        type="donut"
                        :options="chartOptionss"
                        :series="series"
                        height="350"
                    ></apexchart>
                </div>
            </v-card>
        </v-col>
         <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card class="d-flex align-center justify-center" style="height: 10vh; width: 10vh; border-radius: 50%">
                <v-btn icon color="white" @click="openPopup" size="80" flat>
                    <PlusIcon stroke-width="1.5" size="60" style="color: grey" />
                </v-btn>
            </v-card>
         </v-col>
        <v-col v-for="(groupItem, index) in groups" :key="groupItem.id" cols="12" sm="12" lg="4">
           
            <v-card :style="{ backgroundColor: groupItem.bgColor }" style="border-radius: 20px; height: 20vh; color: white ; z-index: 0;">
                <v-btn
                    :style="{ backgroundColor: groupItem.bgColor }"
                    icon
                    @click="showConfirmationDialog(groupItem.id)"
                    style="position: absolute; right: 10px; top: 10px; z-index: 10"
                >
                    <TrashIcon stroke-width="1.5" size="24" />
                </v-btn>
                <div class="inside-card">
                    <h4>{{ groupItem.name }} {{ groupItem.number || 0 }}</h4>
                </div>
                <div class="total">
                    <h1>{{ Math.floor(Math.random() * 10) }}</h1>
                    <div class="images">
                        <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                        <img src="../../assets/images/profile/user-5.jpg" id="img2" alt="" srcset="" />
                        <img src="../../assets/images/profile/user-6.jpg" alt="" srcset="" />
                    </div>
                </div>
            </v-card>
        </v-col>
       <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopupp" class="popup-card" >
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add New Group</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <div class="formContainer">
                            <fieldset class="field1">
                                <div class="inputGroup">
                                    <input type="text" v-model="groupForm.name" autocomplete="off" />
                                    <label for="name">{{ t('Group Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <input type="number" v-model="groupForm.number" autocomplete="off" />
                                    <label for="name">{{ t('Group Number') }}</label>
                                </div>
                            </fieldset>
                        </div>
                        <v-btn color="primary" type="submit" id="add">Add</v-btn>
                        <v-btn id="add" @click="resetForm1">Cancel</v-btn>
                    </form>
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
.title {
    position: sticky;
    top: 0;
    width: 97%;
    height: 60px;
}

.title h1 {
    text-align: center;
    text-transform: uppercase;
    font-size: 26px;
    letter-spacing: 1px;

    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    text-align: center;
}

.title h1:after,
.title h1:before {
    content: ' ';
    display: block;
    border-bottom: 2px solid #ccc;
}


.inputGroup {
    font-family: 'Segoe UI', sans-serif;
    margin: 1em 0 1em 0;
    max-width: 100%;
    position: relative;
}

.inputGroup input {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
}

.inputGroup label {
    font-size: 100%;
    position: absolute;
    left: 0;
    padding: 0.8em;
    margin-left: 0.5em;
    pointer-events: none;
    transition: all 0.3s ease;
    color: rgb(100, 100, 100);
}

.inputGroup :is(input:focus, input:valid) ~ label {
    transform: translateY(-50%) scale(0.9);
    margin: 0em;
    margin-left: 1.3em;
    padding: 0.4em;
    background-color: white;
}

.inputGroup :is(input:focus, input:valid) {
    border-color: rgb(150, 150, 200);
}
.animated-input {
    font-size: 0.9rem;
    background-color: rgba(136, 136, 136, 0.052);
    padding-inline: 0.5em;
    padding-block: 0.7em;
    border-radius: 17px;
    padding-left: 50px;
}
.animated-input:focus {
    outline: none;
}
.animated-input:not(:placeholder-shown) ~ .reset {
    opacity: 1;
    visibility: visible;
}
/* Define the transition effect */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}
.slide-enter {
    transform: translateX(100%);
    opacity: 0;
}
.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
/* Popup overlay */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* Popup content */
.popup-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    width: 300px;
}

.popup-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
}
.popup-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.popup-actions button:first-child {
    background-color: #ff5252;
    color: white;
}

.popup-actions button:last-child {
    background-color: #ccc;
    color: black;
}
.popup-card {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.173);
    /* Dark transparent overlay */
    backdrop-filter: blur(6px); /* Apply the glass effect */
    -webkit-backdrop-filter: blur(6px); /* Safari support */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-contentp {
    width: 67%;
    height: 37vh;
    background: rgb(255, 255, 255); /* Transparent white background */
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Soft shadow for depth */
    text-align: center;
    color: #000000; /* White text for contrast */
    border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for definition */
    transform: translateX(11%);
}
.formContainer {
    display: flex;
    gap: 20px; /* Space between the fieldsets */
    align-items: stretch; /* Ensures fieldsets have the same height */
    margin-bottom: 2em;
}
form fieldset {
    flex: 1; /* Ensures both fieldsets take up equal space */
    border: 1px solid #ccc; /* Optional: add a border for clarity */
    padding: 13px;
    min-width: 0; /* Prevents overflow issues */
}

.inputGroup {
}

label {
    margin-bottom: 5px;
    font-weight: bold;
}
#add {
     width: 20%;
    margin: 3px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
