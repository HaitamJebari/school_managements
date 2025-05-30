<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon, TrashIcon, PlusIcon, XIcon, CalendarIcon, UserIcon, BookIcon, ClockIcon } from 'vue-tabler-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';

const { locale, t } = useI18n();

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');
const activeTab = ref('all'); // 'all', 'today', 'week', 'month'
const searchQuery = ref('');

// Absence form
const absenceForm = ref({
    module_name: '',
    student_name: '',
    absence_date: new Date().toISOString().substr(0, 10),
    seance: '',
    justification: ''
});

// Seance options
const seanceOptions = ['8:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00', 'Full Day'];

// Data from backend
const absencesData = ref([]);
const studentNames = ref([]);
const moduleNames = ref([]);
const summary = ref({
    total: 0,
    byModule: [],
    byStudent: [],
    byDate: [],
    bySeance: []
});

// Computed properties for filtered data
const filteredAbsencesData = computed(() => {
    let filtered = [...absencesData.value];

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (activeTab.value === 'today') {
        filtered = filtered.filter((item) => {
            const absenceDate = new Date(item.absence_date);
            absenceDate.setHours(0, 0, 0, 0);
            return absenceDate.getTime() === today.getTime();
        });
    } else if (activeTab.value === 'week') {
        filtered = filtered.filter((item) => {
            const absenceDate = new Date(item.absence_date);
            absenceDate.setHours(0, 0, 0, 0);
            return absenceDate >= oneWeekAgo;
        });
    } else if (activeTab.value === 'month') {
        filtered = filtered.filter((item) => {
            const absenceDate = new Date(item.absence_date);
            absenceDate.setHours(0, 0, 0, 0);
            return absenceDate >= oneMonthAgo;
        });
    }

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (item) =>
                item.module_name.toLowerCase().includes(query) ||
                item.student_name.toLowerCase().includes(query) ||
                item.seance.toLowerCase().includes(query)
        );
    }

    return filtered;
});

// Open popup method
const openPopup = async () => {
    showPopupp.value = true;
    absenceForm.value.absence_date = new Date().toISOString().substr(0, 10);

    // Fetch student and module names if not already loaded
    if (studentNames.value.length === 0) {
        await fetchStudentNames();
    }

    if (moduleNames.value.length === 0) {
        await fetchModuleNames();
    }
};

// Close popup method
const closePopup = () => {
    showPopupp.value = false;
};

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;
const warning = '#FFC107';

// Fetch absences data
const fetchAbsencesData = async () => {
    try {
        const response = await axios.get('http://localhost:5000/absences');
        absencesData.value = response.data;
        console.log('Absences data:', absencesData.value);
    } catch (error) {
        console.error('Error fetching absences data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load absences data. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    }
};

// Fetch student names for dropdown
const fetchStudentNames = async () => {
    try {
        const response = await axios.get('http://localhost:5000/absences/students');
        studentNames.value = response.data;
        console.log('Student names:', studentNames.value);
    } catch (error) {
        console.error('Error fetching student names:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load student names. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    }
};

// Fetch module names for dropdown
const fetchModuleNames = async () => {
    try {
        const response = await axios.get('http://localhost:5000/absences/modules');
        moduleNames.value = response.data;
        console.log('Module names:', moduleNames.value);
    } catch (error) {
        console.error('Error fetching module names:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load module names. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    }
};

// Fetch absence summary
const fetchAbsenceSummary = async () => {
    try {
        const response = await axios.get('http://localhost:5000/absences/summary');
        summary.value = response.data;
        console.log('Absence summary:', summary.value);
    } catch (error) {
        console.error('Error fetching absence summary:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load absence summary. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    }
};

// Add new absence
const addAbsence = async () => {
    if (!absenceForm.value.module_name || !absenceForm.value.student_name || !absenceForm.value.absence_date || !absenceForm.value.seance) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Module name, student name, absence date, and seance are required',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/absences', {
            module_name: absenceForm.value.module_name,
            student_name: absenceForm.value.student_name,
            absence_date: absenceForm.value.absence_date,
            seance: absenceForm.value.seance,
            justification: absenceForm.value.justification
        });

        Swal.fire({
            icon: 'success',
            title: 'Absence recorded successfully!',
             customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
        });

        // Reset form and refresh data
        absenceForm.value = {
            module_name: '',
            student_name: '',
            absence_date: new Date().toISOString().substr(0, 10),
            seance: '',
            justification: ''
        };
        closePopup();
        await fetchAbsencesData();
        await fetchAbsenceSummary();
    } catch (error) {
        console.error('Error adding absence:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to record absence',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    }
};

// Delete absence
const deleteAbsence = (id) => {
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
                    const response = await axios.delete(`http://localhost:5000/absences/${id}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: 'The absence record has been deleted successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK',
           
                        });
                        // Update the local data
                        await fetchAbsencesData();
                        await fetchAbsenceSummary();
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: 'Failed!',
                            text: 'Failed to delete the absence record.',
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
                        confirmButton: 'btn btn-info'
                    }
                });
            }
        });
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Chart options for module breakdown
const moduleChartOptions = computed(() => {
    const modules = summary.value.byModule?.map((item) => item.module_name) || [];
    const counts = summary.value.byModule?.map((item) => item.count) || [];

    return {
        series: [
            {
                name: 'Absences',
                data: counts
            }
        ],
        chartOptions: {
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: [error],
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    columnWidth: '60%',
                    distributed: true
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: modules,
                labels: {
                    style: {
                        colors: '#a1aab2',
                        fontSize: '12px'
                    },
                    rotate: -45,
                    rotateAlways: true
                }
            },
            yaxis: {
                title: {
                    text: 'Number of Absences'
                },
                labels: {
                    style: {
                        colors: '#a1aab2'
                    }
                }
            },
            title: {
                text: 'Absences by Module',
                align: 'center',
                style: {
                    fontSize: '16px'
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + ' absences';
                    }
                }
            }
        }
    };
});

// Chart options for student breakdown
const studentChartOptions = computed(() => {
    const students = summary.value.byStudent?.map((item) => item.student_name) || [];
    const counts = summary.value.byStudent?.map((item) => item.count) || [];

    return {
        series: counts,
        chartOptions: {
            chart: {
                type: 'donut',
                height: 350
            },
            labels: students,
            colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
            legend: {
                position: 'bottom',
                fontSize: '12px'
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val.toFixed(1) + '%';
                }
            },
            title: {
                text: 'Top Students with Absences',
                align: 'center',
                style: {
                    fontSize: '16px'
                }
            },
            tooltip: {
                y: {
                    formatter: function (val, { seriesIndex, dataPointIndex, w }) {
                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        const percent = ((val / total) * 100).toFixed(1);
                        return w.globals.labels[dataPointIndex] + ': ' + val + ' absences (' + percent + '%)';
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ]
        }
    };
});

// Chart options for date trend
const dateChartOptions = computed(() => {
    const dates = summary.value.byDate?.map((item) => formatDate(item.absence_date)) || [];
    const counts = summary.value.byDate?.map((item) => item.count) || [];

    return {
        series: [
            {
                name: 'Absences',
                data: counts
            }
        ],
        chartOptions: {
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: [primary],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: dates,
                labels: {
                    style: {
                        colors: '#a1aab2'
                    },
                    rotate: -45,
                    rotateAlways: true
                }
            },
            yaxis: {
                title: {
                    text: 'Number of Absences'
                },
                labels: {
                    style: {
                        colors: '#a1aab2'
                    }
                }
            },
            title: {
                text: 'Absence Trend',
                align: 'center',
                style: {
                    fontSize: '16px'
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + ' absences';
                    }
                }
            }
        }
    };
});

// Chart options for seance breakdown
const seanceChartOptions = computed(() => {
    const seances = summary.value.bySeance?.map((item) => item.seance) || [];
    const counts = summary.value.bySeance?.map((item) => item.count) || [];

    return {
        series: [
            {
                name: 'Absences',
                data: counts
            }
        ],
        chartOptions: {
            chart: {
                type: 'radar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: [warning],
            xaxis: {
                categories: seances,
                labels: {
                    style: {
                        colors: '#a1aab2',
                        fontSize: '12px'
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
            title: {
                text: 'Absences by Seance',
                align: 'center',
                style: {
                    fontSize: '16px'
                }
            },
            markers: {
                size: 5,
                hover: {
                    size: 7
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + ' absences';
                    }
                }
            }
        }
    };
});

// Submit form
const submitForm = () => {
    addAbsence();
};

// Reset form
const resetForm = () => {
    absenceForm.value = {
        module_name: '',
        student_name: '',
        absence_date: new Date().toISOString().substr(0, 10),
        seance: '',
        justification: ''
    };
};

// Set active tab
const setActiveTab = (tab) => {
    activeTab.value = tab;
};

onMounted(async () => {
    await fetchAbsencesData();
    await fetchAbsenceSummary();
    await fetchStudentNames();
    await fetchModuleNames();
});
</script>

<template>
    <v-row>
        <!-- Header Card -->
        <v-col cols="12" sm="12" lg="12" class="mt-5">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1 font-weight-semibold">Absences Management</h5>
                        </div>
                        <div>
                            <v-btn icon color="white" @click="openPopup" size="40" flat>
                                <PlusIcon stroke-width="1.5" size="40" style="color: black" />
                            </v-btn>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Summary Cards -->
        <v-col cols="12" sm="12" md="3">
            <v-card elevation="10" style="border-radius: 20px; background-color: #f44336; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <CalendarIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Total Absences</h6>
                            <h4 class="text-h4 font-weight-bold">{{ summary.total || 0 }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="3">
            <v-card elevation="10" style="border-radius: 20px; background-color: #9c27b0; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <UserIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Students with Absences</h6>
                            <h4 class="text-h4 font-weight-bold">{{ summary.byStudent?.length || 0 }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="3">
            <v-card elevation="10" style="border-radius: 20px; background-color: #2196f3; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <BookIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Modules with Absences</h6>
                            <h4 class="text-h4 font-weight-bold">{{ summary.byModule?.length || 0 }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="3">
            <v-card elevation="10" style="border-radius: 20px; background-color: #ffc107; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <ClockIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Seances with Absences</h6>
                            <h4 class="text-h4 font-weight-bold">{{ summary.bySeance?.length || 0 }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Charts Row 1 -->
        <v-col cols="12" sm="12" lg="6">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div v-if="summary.byModule && summary.byModule.length > 0">
                        <apexchart
                            type="bar"
                            height="350"
                            :options="moduleChartOptions.chartOptions"
                            :series="moduleChartOptions.series"
                        ></apexchart>
                    </div>
                    <div v-else class="text-center py-8">
                        <p>No module data available</p>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" lg="6">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div v-if="summary.byStudent && summary.byStudent.length > 0">
                        <apexchart
                            type="donut"
                            height="350"
                            :options="studentChartOptions.chartOptions"
                            :series="studentChartOptions.series"
                        ></apexchart>
                    </div>
                    <div v-else class="text-center py-8">
                        <p>No student data available</p>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Absences Table -->
        <v-col cols="12">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div>
                            <h5 class="text-h6 font-weight-semibold">Absence Records</h5>
                        </div>
                        <div class="d-flex align-center">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="mr-4"
                                style="max-width: 200px"
                            ></v-text-field>
                            <v-btn-toggle v-model="activeTab" mandatory>
                                <v-btn value="all" color="primary" variant="text">All</v-btn>
                                <v-btn value="today" color="success" variant="text">Today</v-btn>
                                <v-btn value="week" color="warning" variant="text">Week</v-btn>
                                <v-btn value="month" color="error" variant="text">Month</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>

                    <v-table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Module</th>
                                <th>Seance</th>
                                <th>Justification</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredAbsencesData" :key="item.id">
                                <td>{{ formatDate(item.absence_date) }}</td>
                                <td>{{ item.student_name }}</td>
                                <td>{{ item.module_name }}</td>
                                <td>{{ item.seance }}</td>
                                <td>{{ item.justification || 'Not provided' }}</td>
                                <td>
                                    <v-btn icon color="error" size="small" @click="deleteAbsence(item.id)">
                                        <TrashIcon stroke-width="1.5" size="16" />
                                    </v-btn>
                                </td>
                            </tr>
                            <tr v-if="filteredAbsencesData.length === 0">
                                <td colspan="6" class="text-center py-4">No absence records found</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Add Absence Popup -->
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopupp" class="popup-card" style="z-index: 10">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add New Absence</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <div class="formContainer">
                            <fieldset class="field1">
                                <div class="inputGroup">
                                    <select id="module_name" v-model="absenceForm.module_name" autocomplete="off">
                                        <option value="">Select Module</option>
                                        <option v-for="(option, index) in moduleNames" :key="index" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <label for="module_name">{{ t('Module Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <select id="student_name" v-model="absenceForm.student_name" autocomplete="off">
                                        <option value="">Select Student</option>
                                        <option v-for="(option, index) in studentNames" :key="index" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <label for="student_name">{{ t('Student Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field3">
                                <div class="inputGroup">
                            <div class="el-date-picker">
                                                <el-date-picker
                                                    v-model="absenceForm.absence_date"
                                                    type="datetime"
                                                    placeholder=" "
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    date-format="MMM DD, YYYY"
                                                    time-format="HH:mm"
                                                    class="custom-date-picker"
                                                >
                                                    <template #prev-month>
                                                        <el-icon><CaretLeft /></el-icon>
                                                    </template>
                                                    <template #next-month>
                                                        <el-icon><CaretRight /></el-icon>
                                                    </template>
                                                    <template #prev-year>
                                                        <el-icon>
                                                            <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                                <g stroke-width="1" fill-rule="evenodd">
                                                                    <g fill="currentColor">
                                                                        <path
                                                                            d="M8.73171,16.7949 C9.03264,17.0795 9.50733,17.0663 9.79196,16.7654 ..."
                                                                        />
                                                                    </g>
                                                                </g>
                                                            </svg>
                                                        </el-icon>
                                                    </template>
                                                    <template #next-year>
                                                        <el-icon>
                                                            <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                                <g stroke-width="1" fill-rule="evenodd">
                                                                    <g fill="currentColor">
                                                                        <path
                                                                            d="M11.2654,3.20511 C10.9644,2.92049 10.4897,2.93371 10.2051,3.23464 ..."
                                                                        />
                                                                    </g>
                                                                </g>
                                                            </svg>
                                                        </el-icon>
                                                    </template>
                                                </el-date-picker>
                                                <label for="date-registration">Pick a Date</label>
                                            </div>   </div>
                            </fieldset>
                            <fieldset class="field4">
                                <div class="inputGroup">
                                    <select id="seance" v-model="absenceForm.seance" autocomplete="off">
                                        <option value="">Select Seance</option>
                                        <option v-for="(option, index) in seanceOptions" :key="index" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <label for="seance">{{ t('Seance') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field5">
                                <div class="inputGroup">
                                    <input type="text" id="justification" v-model="absenceForm.justification" autocomplete="off" />
                                    <label for="justification">{{ t('Justification (Optional)') }}</label>
                                </div>
                            </fieldset>
                        </div>
                        <v-btn color="primary" type="submit" id="add">Add</v-btn>
                        <v-btn id="add" @click="resetForm">Cancel</v-btn>
                    </form>
                </div>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>
.inputGroup .el-date-picker {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
    position: relative;
}
.inputGroup .el-date-picker {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
    position: relative;
}

.el-date-picker {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
    border: none;
}
.el-date-picker label {
    transform: translateY(-18%);
}
.el-date-picker__editor-wrap {
    padding: 0.8em;
    border-radius: 20px;
}

.el-date-picker {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
    border: none;
}
.el-date-picker label {
    transform: translateY(-18%);
}
.el-date-picker__editor-wrap {
    padding: 0.8em;
    border-radius: 20px;
}
.inside-card {
    padding: 1em;
}
h1 {
    font-size: 2em;
    font-weight: bold;
    font-family: 'Poppins', sans-serif;
}
h4 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5em;
    margin-bottom: 0.5em;
}
p {
    font-family: 'Poppins', sans-serif;
    margin: 0.3em 0;
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
    height: 65vh;
    background: rgb(255, 255, 255); /* Transparent white background */
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Soft shadow for depth */
    text-align: center;
    color: #000000; /* White text for contrast */
    border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for definition */
    transform: translateX(11%);
    margin-top: 70px;
}
.formContainer {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
    margin-bottom: 2em;
}
.inputGroup {
    position: relative;
    margin-bottom: 1em;
}
.inputGroup input,
.inputGroup select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s;
}
.inputGroup label {
    position: absolute;
    top: -10px;
    left: 10px;
    background-color: white;
    padding: 0 5px;
    font-size: 14px;
    color: #666;
}
.inputGroup input:focus,
.inputGroup select:focus {
    border-color: #2196f3;
    outline: none;
}
#add {
     width: 20%;
    margin: 3px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
