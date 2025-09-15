<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon, TrashIcon, PlusIcon, XIcon, CalendarIcon, UserIcon, BookIcon, ClockIcon } from 'vue-tabler-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';
import { CaretLeft, CaretRight } from '@element-plus/icons-vue';

// Define interfaces
interface Absence {
    id: number;
    module_name: string;
    student_name: string;
    absence_date: string;
    seance: string;
    justification: string;
}

interface AbsenceForm {
    module_name: string;
    student_name: string;
    absence_date: string;
    seance: string;
    justification: string;
}

interface SummaryItem {
    module_name?: string;
    student_name?: string;
    absence_date?: string;
    seance?: string;
    count: number;
}

interface Summary {
    total: number;
    byModule: SummaryItem[];
    byStudent: SummaryItem[];
    byDate: SummaryItem[];
    bySeance: SummaryItem[];
}

const { locale, t } = useI18n();

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');
const activeTab = ref('all'); // 'all', 'today', 'week', 'month'
const searchQuery = ref('');

// Absence form
const absenceForm = ref<AbsenceForm>({
    module_name: '',
    student_name: '',
    absence_date: new Date().toISOString().substr(0, 10),
    seance: '',
    justification: ''
});

// Seance options
const seanceOptions = ['8:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00', 'Full Day'];

// Data from backend
const absencesData = ref<Absence[]>([]);
const studentNames = ref<string[]>([]);
const moduleNames = ref<string[]>([]);
const summary = ref<Summary>({
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


const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;
const warning = '#FFC107';

// Fetch absences data
const fetchAbsencesData = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger mx-2',
        },
        buttonsStyling: false
    });
    try {
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/absences');
        absencesData.value = response.data;
        console.log('Absences data:', absencesData.value);
    } catch (error) {
        console.error('Error fetching absences data:', error);
        swalWithBootstrapButtons.fire({
            icon: 'error',
            title: t('Error!'),
            text: t('Failed to load absences data. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    }
};

// Fetch student names for dropdown
const fetchStudentNames = async () => {
    try {
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/absences/students');
        studentNames.value = response.data;
        console.log('Student names:', studentNames.value);
    } catch (error) {
        console.error('Error fetching student names:', error);
        Swal.fire({
            icon: 'error',
            title: t('Error!'),
            text: t('Failed to load student names. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    }
};

// Fetch module names for dropdown
const fetchModuleNames = async () => {
    try {
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/absences/modules');
        moduleNames.value = response.data;
        console.log('Module names:', moduleNames.value);
    } catch (error) {
        console.error('Error fetching module names:', error);
        Swal.fire({
            icon: 'error',
            title: t('Error!'),
            text: t('Failed to load module names. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    }
};

// Fetch absence summary
const fetchAbsenceSummary = async () => {
    try {
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/absences/summary');
        summary.value = response.data;
        console.log('Absence summary:', summary.value);
    } catch (error) {
        console.error('Error fetching absence summary:', error);
        Swal.fire({
            icon: 'error',
            title: t('Error!'),
            text: t('Failed to load absence summary. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    }
};

// Add new absence
const addAbsence = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success mx-2',
            cancelButton: 'btn btn-danger mx-2'
        },
        buttonsStyling: false
    });
    if (!absenceForm.value.module_name || !absenceForm.value.student_name || !absenceForm.value.absence_date || !absenceForm.value.seance) {
        swalWithBootstrapButtons.fire({
            icon: 'warning',
            title: t('Validation') + ' ' + t('Error!'),
            text: t('Module name, student name, absence date, and seance are required'),
            confirmButtonText: t('OK')
        });
        return;
    }

    try {
        const response = await axios.post('https://school-management-cyan-seven.vercel.app/absences', {
            module_name: absenceForm.value.module_name,
            student_name: absenceForm.value.student_name,
            absence_date: absenceForm.value.absence_date,
            seance: absenceForm.value.seance,
            justification: absenceForm.value.justification
        });

        swalWithBootstrapButtons.fire({
            icon: 'success',
            title: t('Absence recorded successfully!'),
            customClass: {
                confirmButton: 'btn btn-success'
            }
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
    } catch (error: any) {
        console.error('Error adding absence:', error);
        swalWithBootstrapButtons.fire({
            icon: 'error',
            title: t('Failed to record absence'),
            text: error.response?.data?.message || t('An error occurred'),
            confirmButtonText: t('OK')
        });
    }
};

// Delete absence
const deleteAbsence = (id: number) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success mx-2',
            cancelButton: 'btn btn-danger mx-2'
        },
        buttonsStyling: false
    });

    swalWithBootstrapButtons
        .fire({
            title: t('Are you sure?'),
            text: t('This action cannot be undone!'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('Yes, delete it!'),
            cancelButtonText: t('No, cancel!'),
            reverseButtons: true
        })
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`https://school-management-cyan-seven.vercel.app/absences/${id}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: t('Deleted!'),
                            text: t('The absence record has been deleted successfully.'),
                            icon: 'success',
                            confirmButtonText: t('OK')
                        });
                        // Update the local data
                        await fetchAbsencesData();
                        await fetchAbsenceSummary();
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: t('Failed!'),
                            text: t('Failed to delete the absence record.'),
                            icon: 'error',
                            confirmButtonText: t('OK'),
                            customClass: {
                                confirmButton: 'btn btn-danger'
                            }
                        });
                    }
                } catch (error: any) {
                    swalWithBootstrapButtons.fire({
                        title: t('Error!'),
                        text: t('Something went wrong during deletion.'),
                        icon: 'error',
                        confirmButtonText: t('OK'),
                        customClass: {
                            confirmButton: 'btn btn-danger'
                        }
                    });
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: t('Cancelled'),
                    icon: 'info',
                    confirmButtonText: t('OK'),
                    customClass: {
                        confirmButton: 'btn btn-info'
                    }
                });
            }
        });
};

// Format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Chart options for module breakdown
const moduleChartOptions = computed(() => {
    const modules = summary.value.byModule?.map((item) => item.module_name || '') || [];
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
                    formatter: function (val: number) {
                        return val + ' absences';
                    }
                }
            }
        }
    };
});

// Chart options for student breakdown
const studentChartOptions = computed(() => {
    const students = summary.value.byStudent?.map((item) => item.student_name || '') || [];
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
                formatter: function (val: number) {
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
                    formatter: function (val: number, { seriesIndex, dataPointIndex, w }: any) {
                        const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
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
    const dates = summary.value.byDate?.map((item) => formatDate(item.absence_date || '')) || [];
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
                    formatter: function (val: number) {
                        return val + ' absences';
                    }
                }
            }
        }
    };
});

// Chart options for seance breakdown
const seanceChartOptions = computed(() => {
    const seances = summary.value.bySeance?.map((item) => item.seance || '') || [];
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
                    formatter: function (val: number) {
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
const setActiveTab = (tab: string) => {
    activeTab.value = tab;
};

onMounted(async () => {
    await fetchAbsencesData();
    await fetchAbsenceSummary();
    await fetchStudentNames();
    await fetchModuleNames();
});
const loading = ref(false);

</script>

<template>
    <v-row>
        
        <!-- Header Card -->
        <v-col cols="12" sm="12" lg="12">
            <v-card elevation="10" style="border-radius: 20px; height: 4em">
                <div class="d-flex align-center justify-space-between px-4" style="height: 100%">
                    <h4 class="m-0">{{ t('Absences Management') }}</h4>
                    <v-btn icon @click="openPopup" size="32" variant="text">
                        <PlusIcon stroke-width="1.5" size="35"  />
                    </v-btn>
                </div>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Total Absences') }}</h6>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Students with Absences') }}</h6>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Modules with Absences') }}</h6>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Seances with Absences') }}</h6>
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
                        <p>{{ t('No module data available') }}</p>
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
                        <p>{{ t('No student data available') }}</p>
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
                            <h5 class="text-h6 font-weight-semibold">{{ t('Absence Records') }}</h5>
                        </div>
                        <div class="d-flex align-center">
                            <v-text-field
                                v-model="searchQuery"
                                :label="t('search here')"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="mr-4"
                                style="width: 15em"
                            ></v-text-field>
                            <v-btn-toggle v-model="activeTab" mandatory>
                                <v-btn value="all" color="primary" variant="text">{{ t('All') }}</v-btn>
                                <v-btn value="today" color="success" variant="text">{{ t('Today') }}</v-btn>
                                <v-btn value="week" color="warning" variant="text">{{ t('Week') }}</v-btn>
                                <v-btn value="month" color="error" variant="text">{{ t('Month') }}</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>

                    <v-table>
                        <thead>
                            <tr>
                                <th>{{ t('Date') }}</th>
                                <th>{{ t('Student') }}</th>
                                <th>{{ t('Module') }}</th>
                                <th>{{ t('Seance') }}</th>
                                <th>{{ t('Justification') }}</th>
                                <th>{{ t('Actions') }}</th>
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
                                <td colspan="6" class="text-center py-4">{{ t('No absence records found') }}</td>
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
                            <h1>{{ t('add') }} {{ t('Abscence') }}</h1>
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
                                    <label for="module_name">{{ t('Module') }} {{ t('Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <select id="student_name" v-model="absenceForm.student_name" autocomplete="off">
                                        <option value="">{{ t('Select') }} {{ t('Student') }}</option>
                                        <option v-for="(option, index) in studentNames" :key="index" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <label for="student_name">{{ t('Student') }} {{ t('Name') }}</label>
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
                                        </el-date-picker>
                                        <label for="date-registration">{{ t('pickDate') }}</label>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="field4">
                                <div class="inputGroup">
                                    <select id="seance" v-model="absenceForm.seance" autocomplete="off">
                                        <option value="">{{t('Select')}} {{ t('Seance') }}</option>
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
                        <v-btn color="primary" type="submit" id="add">{{ t('add') }}</v-btn>
                        <v-btn id="add" @click="resetForm">{{ t('cancel') }}</v-btn>
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
    height: 68vh;
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
@media (max-width: 1080px) {
    .popup-card {
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.173);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 1000;
    }

    .popup-contentp {
        position: absolute;
        top: 20%;
        left: 0;
        height: 60vh;
        width: 80%;
        background: rgb(255, 255, 255); /* Transparent white background */
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Soft shadow for depth */
        text-align: center;
        color: #000000; /* White text for contrast */
        border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for definition */
        transform: translateX(11%);
    }
    
}
</style>
