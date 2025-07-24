<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon, TrashIcon, PlusIcon, XIcon, CashIcon, CreditCardIcon, WalletIcon } from 'vue-tabler-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';

const { locale, t } = useI18n();

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');
const activeTab = ref('all'); // 'all', 'income', 'outcome'
const isLoading = ref(false);

// Revenue form
const revenueForm = ref({
    description: '',
    amount: '',
    type: 'income',
    category: '',
    date: new Date().toISOString().substr(0, 10)
});

// Category options
const categoryOptions = [
    'Cafeteria',
    'Sponsorships',
    'Donations',
    'Parents',
    'Tuition Fees',
    'Books & Supplies',
    'Salaries',
    'Utilities',
    'Maintenance',
    'Events',
    'Transportation',
    'Equipment',
    'Marketing',
    'Other'
];

// Revenue data
const revenueData = ref([]);
const summary = ref({
    total_income: 0,
    total_outcome: 0,
    balance: 0,
    income_in_outcome: 0 // New field to track income that should be in outcome
});
const monthlyData = ref([]);
const categoryData = ref([]);

// Computed properties for filtered data
const filteredRevenueData = computed(() => {
    if (activeTab.value === 'all') {
        return revenueData.value;
    } else {
        return revenueData.value.filter((item) => item.type === activeTab.value);
    }
});

// Open popup method
const openPopup = async () => {
    showPopupp.value = true;
    revenueForm.value.date = new Date().toISOString().substr(0, 10);
};

// Close popup method
const closePopup = () => {
    showPopupp.value = false;
};

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;
const success = '#4CAF50';

// Fetch revenue data
const fetchRevenueData = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get('http://localhost:5000/revenue');
        revenueData.value = response.data;
        console.log('Revenue data:', revenueData.value);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load revenue data. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    } finally {
        isLoading.value = false;
    }
};

// Fetch revenue summary
const fetchRevenueSummary = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get('http://localhost:5000/revenue/summary');
        summary.value = response.data.summary;
        monthlyData.value = response.data.monthly;
        categoryData.value = response.data.categories;

        // Also fetch income that should be in outcome
        try {
            const incomeInOutcomeResponse = await axios.get('http://localhost:5000/revenue/income-in-outcome');
            summary.value.income_in_outcome = incomeInOutcomeResponse.data.total_income_for_outcome;
        } catch (error) {
            console.error('Error fetching income in outcome:', error);
            summary.value.income_in_outcome = 0;
        }

        console.log('Revenue summary:', summary.value);
        console.log('Monthly data:', monthlyData.value);
        console.log('Category data:', categoryData.value);
    } catch (error) {
        console.error('Error fetching revenue summary:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load revenue summary. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    } finally {
        isLoading.value = false;
    }
};

// Add new revenue entry
const addRevenue = async () => {
    if (!revenueForm.value.description || !revenueForm.value.amount || !revenueForm.value.date) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Description, amount, and date are required',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        isLoading.value = true;
        const response = await axios.post('http://localhost:5000/revenue', {
            description: revenueForm.value.description,
            amount: parseFloat(revenueForm.value.amount),
            type: revenueForm.value.type,
            category: revenueForm.value.category,
            date: revenueForm.value.date
        });

        Swal.fire({
            icon: 'success',
            title: 'Revenue entry added successfully!',
            text:
                revenueForm.value.type === 'income'
                    ? 'Income entry added and will be reflected in both income and outcome calculations.'
                    : 'Revenue entry added successfully.',
            customClass: {
                confirmButton: 'btn btn-success'
            }
        });

        // Reset form and refresh data
        revenueForm.value = {
            description: '',
            amount: '',
            type: 'income',
            category: '',
            date: new Date().toISOString().substr(0, 10)
        };
        closePopup();
        await fetchRevenueData();
        await fetchRevenueSummary();
    } catch (error) {
        console.error('Error adding revenue entry:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to add revenue entry',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    } finally {
        isLoading.value = false;
    }
};

// Delete revenue entry
const deleteRevenue = (id) => {
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
                    isLoading.value = true;
                    const response = await axios.delete(`http://localhost:5000/revenue/${id}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: response.data.message || 'The revenue entry has been deleted successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // Update the local data
                        await fetchRevenueData();
                        await fetchRevenueSummary();
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: 'Failed!',
                            text: 'Failed to delete the revenue entry.',
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
                } finally {
                    isLoading.value = false;
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

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Chart options for monthly trend
const monthlyChartOptions = computed(() => {
    const months = monthlyData.value.map((item) => item.month);
    const incomeData = monthlyData.value.map((item) => parseFloat(item.income));
    const outcomeData = monthlyData.value.map((item) => parseFloat(item.outcome));

    return {
        series: [
            {
                name: 'Income',
                data: incomeData
            },
            {
                name: 'Outcome',
                data: outcomeData
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
            colors: [success, error],
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
                categories: months,
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
                    },
                    formatter: function (value) {
                        return '$' + value.toFixed(0);
                    }
                }
            },
            tooltip: {
                x: {
                    format: 'MM yyyy'
                },
                y: {
                    formatter: function (value) {
                        return '$' + value.toFixed(2);
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            }
        }
    };
});

// Chart options for category breakdown
const categoryChartOptions = computed(() => {
    // Process category data
    const incomeCategories = categoryData.value
        .filter((item) => item.type === 'income')
        .map((item) => ({ name: item.category || 'Uncategorized', value: parseFloat(item.total) }));

    const outcomeCategories = categoryData.value
        .filter((item) => item.type === 'outcome')
        .map((item) => ({ name: item.category || 'Uncategorized', value: parseFloat(item.total) }));

    return {
        incomePieOptions: {
            series: incomeCategories.map((item) => item.value),
            chartOptions: {
                chart: {
                    type: 'donut',
                    height: 240
                },
                labels: incomeCategories.map((item) => item.name),
                colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'],
                legend: {
                    position: 'bottom'
                },
                dataLabels: {
                    enabled: false
                },
                tooltip: {
                    y: {
                        formatter: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                title: {
                    text: 'Income by Category',
                    align: 'center'
                }
            }
        },
        outcomePieOptions: {
            series: outcomeCategories.map((item) => item.value),
            chartOptions: {
                chart: {
                    type: 'donut',
                    height: 240
                },
                labels: outcomeCategories.map((item) => item.name),
                colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'],
                legend: {
                    position: 'bottom'
                },
                dataLabels: {
                    enabled: false
                },
                tooltip: {
                    y: {
                        formatter: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                title: {
                    text: 'Outcome by Category',
                    align: 'center'
                }
            }
        }
    };
});

// Submit form
const submitForm = () => {
    addRevenue();
};

// Reset form
const resetForm = () => {
    revenueForm.value = {
        description: '',
        amount: '',
        type: 'income',
        category: '',
        date: new Date().toISOString().substr(0, 10)
    };
};

// Set active tab
const setActiveTab = (tab) => {
    activeTab.value = tab;
};

// Computed property for combined outcome total (including income)
const combinedOutcomeTotal = computed(() => {
    return summary.value.total_outcome + summary.value.income_in_outcome;
});

onMounted(async () => {
    await fetchRevenueData();
    await fetchRevenueSummary();
});
</script>

<template>
    <v-row>
        <!-- Loading overlay -->
        <v-overlay v-model="isLoading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- Header Card -->
        <v-col cols="12" sm="12" lg="12" class="mt-5">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1 font-weight-semibold">Financials Management</h5>
                        </div>
                        <div>
                            <!-- Add Button -->
                            <v-btn icon color="white" @click="openPopup" size="40" flat>
                                <PlusIcon stroke-width="1.5" size="40" style="color: black" />
                            </v-btn>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Summary Cards -->
        <v-col cols="12" sm="12" md="4">
            <v-card elevation="10" style="border-radius: 20px; background-color: #4caf50; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <CashIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Total Income</h6>
                            <h4 class="text-h4 font-weight-bold">{{ formatCurrency(summary.total_income) }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="4">
            <v-card elevation="10" style="border-radius: 20px; background-color: #f44336; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <CreditCardIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Total Outcome</h6>
                            <h4 class="text-h4 font-weight-bold">{{ formatCurrency(summary.total_outcome) }}</h4>
                            <p class="text-caption" v-if="summary.income_in_outcome > 0">
                                Including income: {{ formatCurrency(combinedOutcomeTotal) }}
                            </p>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="4">
            <v-card elevation="10" style="border-radius: 20px; background-color: #2196f3; color: white">
                <v-card-item>
                    <div class="d-flex align-center">
                        <div class="mr-4">
                            <WalletIcon stroke-width="1.5" size="48" />
                        </div>
                        <div>
                            <h6 class="text-subtitle-1 mb-1">Balance</h6>
                            <h4 class="text-h4 font-weight-bold">{{ formatCurrency(summary.balance) }}</h4>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Monthly Trend Chart -->
        <v-col cols="12" sm="12" lg="8">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div>
                            <h5 class="text-h6 font-weight-semibold">Monthly Financials Trend</h5>
                        </div>
                    </div>
                    <div v-if="monthlyData.length > 0">
                        <apexchart
                            type="area"
                            height="350"
                            :options="monthlyChartOptions.chartOptions"
                            :series="monthlyChartOptions.series"
                        ></apexchart>
                    </div>
                    <div v-else class="text-center py-8">
                        <p>No monthly data available</p>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Category Breakdown Charts -->
        <v-col cols="12" sm="12" lg="4">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div v-if="categoryData.length > 0">
                        <div class="mb-6">
                            <apexchart
                                type="donut"
                                height="240"
                                :options="categoryChartOptions.incomePieOptions.chartOptions"
                                :series="categoryChartOptions.incomePieOptions.series"
                            ></apexchart>
                        </div>
                        <div>
                            <apexchart
                                type="donut"
                                height="240"
                                :options="categoryChartOptions.outcomePieOptions.chartOptions"
                                :series="categoryChartOptions.outcomePieOptions.series"
                            ></apexchart>
                        </div>
                    </div>
                    <div v-else class="text-center py-8">
                        <p>No category data available</p>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Revenue Entries Tabs -->
        <v-col cols="12">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div>
                            <h5 class="text-h6 font-weight-semibold">Financials Entries</h5>
                        </div>
                        <div>
                            <v-btn-toggle v-model="activeTab" mandatory>
                                <v-btn value="all" color="primary" variant="text">All</v-btn>
                                <v-btn value="income" color="success" variant="text">Income</v-btn>
                                <v-btn value="outcome" color="error" variant="text">Outcome</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>

                    <v-table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredRevenueData" :key="item.id">
                                <td>{{ formatDate(item.date) }}</td>
                                <td>{{ item.description }}</td>
                                <td>{{ item.category || 'Uncategorized' }}</td>
                                <td :class="item.type === 'income' ? 'text-success' : 'text-error'">
                                    {{ formatCurrency(item.amount) }}
                                </td>
                                <td>
                                    <v-chip :color="item.type === 'income' ? 'success' : 'error'" text-color="white" size="small">
                                        {{ item.type }}
                                    </v-chip>
                                </td>
                                <td>
                                    <v-btn icon variant="text" color="error" @click="deleteRevenue(item.id)">
                                        <TrashIcon stroke-width="1.5" size="20" />
                                    </v-btn>
                                </td>
                            </tr>
                            <tr v-if="filteredRevenueData.length === 0">
                                <td colspan="6" class="text-center py-4">No entries found</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Add Revenue Popup -->
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopupp" class="popup-card" style="z-index: 10">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add Income / Outcome</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <fieldset class="field1">
                            <div class="inputGroup">
                                <input type="text" id="Descripton" v-model="revenueForm.description" autocomplete="off" />
                                <label for="Descripton">Descripton</label>
                            </div>
                        </fieldset>
                        <fieldset class="field2">
                            <div class="inputGroup">
                                <input type="number" id="Amount" v-model="revenueForm.amount" autocomplete="off" />
                                <label for="Amount">Amount</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <select id="type" v-model="revenueForm.type" class="select-input">
                                    <option value="" disabled>Select Type</option>
                                    <option v-for="(option, index) in ['income', 'outcome']" :key="index" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <label for="type">Type</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <select id="category" v-model="revenueForm.category" class="select-input">
                                    <option value="" disabled>Select Category</option>
                                    <option v-for="(option, index) in categoryOptions" :key="index" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <label for="category">Category</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <div class="el-date-picker">
                                    <el-date-picker
                                        v-model="revenueForm.date"
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
                                    <label for="date">Pick a Date</label>
                                </div>
                            </div>
                        </fieldset>

                        <v-btn
                           
                            :color="revenueForm.type === 'income' ? 'primary' : 'error'"
                             type="submit" id="add"
                            >Add {{ revenueForm.type === 'income' ? 'Income' : 'Outcome' }}</v-btn
                        >
                        <v-btn id="add" class="cancel-btn" @click="resetForm">Cancel</v-btn>
                    </form>
                </div>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>

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
    height: 65vh;
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
    flex-direction: column;
    gap: 1.5em;
    margin-bottom: 2em;
}
.inputGroup {
    font-family: 'Segoe UI', sans-serif;
    margin: 1em 0 1em 0;
    max-width: 100%;
    position: relative;
}
.inputGroup input, .inputGroup .select-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s;
    background-color: white;
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
.inputGroup input:focus, .inputGroup .select-input:focus {
    border-color: #2196F3;
    outline: none;
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
.add-btn {
    margin-right: 10px;
}
.cancel-btn {
    margin-left: 10px;
}
.select-input {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 1em;
    padding-right: 30px;
}

#add {
    width: 20%;
    margin: 3px;
    margin-top: 3em;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
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
</style>
