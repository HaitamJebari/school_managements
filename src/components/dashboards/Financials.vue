<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import { TrashIcon, PlusIcon, XIcon, CashIcon, CreditCardIcon, WalletIcon } from 'vue-tabler-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import { CaretLeft, CaretRight } from '@element-plus/icons-vue';

// Define interfaces
interface financialsItem {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'outcome';
    category: string;
    date: string;
}

interface financialsSummary {
    total_income: number;
    total_outcome: number;
    balance: number;
    income_in_outcome: number;
}

interface MonthlyDataItem {
    month: string;
    income: string;
    outcome: string;
}

interface CategoryDataItem {
    category: string;
    type: 'income' | 'outcome';
    total: string;
}

interface financialsForm {
    description: string;
    amount: string;
    type: 'income' | 'outcome';
    category: string;
    date: string;
}

const { locale, t } = useI18n();

// Reactive variables
const showPopupp = ref(false);
const activeTab = ref('all'); // 'all', 'income', 'outcome'
const isLoading = ref(false);

// financials form
const financialsForm = ref<financialsForm>({
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

// financials data
const financialsData = ref<financialsItem[]>([]);
const summary = ref<financialsSummary>({
    total_income: 0,
    total_outcome: 0,
    balance: 0,
    income_in_outcome: 0
});
const monthlyData = ref<MonthlyDataItem[]>([]);
const categoryData = ref<CategoryDataItem[]>([]);

// Computed properties for filtered data
const filteredfinancialsData = computed(() => {
    if (activeTab.value === 'all') {
        return financialsData.value;
    } else {
        return financialsData.value.filter((item) => item.type === activeTab.value);
    }
});

// Open popup method
const openPopup = async () => {
    showPopupp.value = true;
    financialsForm.value.date = new Date().toISOString().substr(0, 10);
};

// Close popup method
const closePopup = () => {
    showPopupp.value = false;
};

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;
const success = '#4CAF50';

// Fetch financials data
const fetchfinancialsData = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/financials');
        financialsData.value = response.data;
        console.log('financials data:', financialsData.value);
    } catch (error) {
        console.error('Error fetching financials data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Loading ' + t('Error!'),
            text: t('Failed to load financials data. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    } finally {
        isLoading.value = false;
    }
};

// Fetch financials summary
const fetchfinancialsSummary = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger mx-2',
        },
        buttonsStyling: false
    });
    try {
        isLoading.value = true;
        const response = await axios.get('https://school-management-cyan-seven.vercel.app/financials/summary');
        summary.value = response.data.summary;
        monthlyData.value = response.data.monthly;
        categoryData.value = response.data.categories;

        // Also fetch income that should be in outcome
        try {
            const incomeInOutcomeResponse = await axios.get('https://school-management-cyan-seven.vercel.app/financials/income-in-outcome');
            summary.value.income_in_outcome = incomeInOutcomeResponse.data.total_income_for_outcome;
        } catch (error) {
            console.error('Error fetching income in outcome:', error);
            summary.value.income_in_outcome = 0;
        }

        console.log(('financials summary:'), summary.value);
        console.log(('Monthly data:'), monthlyData.value);
        console.log(('Category data:'), categoryData.value);
    } catch (error) {
        console.error('Error fetching financials summary:', error);
        swalWithBootstrapButtons.fire({
            icon: 'error',
            title: 'Loading ' + t('Error!'),
            text: t('Failed to load financials summary. Please refresh the page.'),
            confirmButtonText: t('OK')
        });
    } finally {
        isLoading.value = false;
    }
};

// Add new financials entry
const addfinancials = async () => {
    if (!financialsForm.value.description || !financialsForm.value.amount || !financialsForm.value.date) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation ' + t('Error!'),
            text: t('Description, amount, and date are required'),
            confirmButtonText: t('OK')
        });
        return;
    }

    try {
        isLoading.value = true;
        const response = await axios.post('https://school-management-cyan-seven.vercel.app/financials', {
            description: financialsForm.value.description,
            amount: parseFloat(financialsForm.value.amount),
            type: financialsForm.value.type,
            category: financialsForm.value.category,
            date: financialsForm.value.date
        });

        Swal.fire({
            icon: 'success',
            title: t('financials entry added successfully!'),
            text:
                financialsForm.value.type === 'income'
                    ? t('Income entry added and will be reflected in both income and outcome calculations.')
                    : t('financials entry added successfully.'),
            customClass: {
                confirmButton: 'btn btn-success'
            }
        });

        // Reset form and refresh data
        financialsForm.value = {
            description: '',
            amount: '',
            type: 'income',
            category: '',
            date: new Date().toISOString().substr(0, 10)
        };
        closePopup();
        await fetchfinancialsData();
        await fetchfinancialsSummary();
    } catch (error: any) {
        console.error('Error adding financials entry:', error);
        Swal.fire({
            icon: 'error',
            title: t('Failed to add financials entry'),
            text: error.response?.data?.message || t('An error occurred'),
            confirmButtonText: t('OK')
        });
    } finally {
        isLoading.value = false;
    }
};

// Delete financials entry
const deletefinancials = (id: number) => {
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
                    isLoading.value = true;
                    const response = await axios.delete(`https://school-management-cyan-seven.vercel.app/financials/${id}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: t('Deleted!'),
                            text: response.data.message || t('The financials entry has been deleted successfully.'),
                            icon: 'success',
                            confirmButtonText: t('OK')
                        });
                        // Update the local data
                        await fetchfinancialsData();
                        await fetchfinancialsSummary();
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: t('Failed!'),
                            text: t('Failed to delete the financials entry.'),
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
                } finally {
                    isLoading.value = false;
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

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Format date
const formatDate = (dateString: string) => {
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
                    formatter: function (value: number) {
                        return '$' + value.toFixed(0);
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (value: number) {
                        return '$' + value.toFixed(2);
                    }
                }
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
                        formatter: function (value: number) {
                            return '$' + value.toFixed(2);
                        }
                    }
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
                        formatter: function (value: number) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    };
});

// Submit form
const submitForm = () => {
    addfinancials();
};

// Reset form
const resetForm = () => {
    financialsForm.value = {
        description: '',
        amount: '',
        type: 'income',
        category: '',
        date: new Date().toISOString().substr(0, 10)
    };
};

// Set active tab
const setActiveTab = (tab: string) => {
    activeTab.value = tab;
};

// Computed property for combined outcome total (including income)
const combinedOutcomeTotal = computed(() => {
    return summary.value.total_outcome + summary.value.income_in_outcome;
});

onMounted(async () => {
    await fetchfinancialsData();
    await fetchfinancialsSummary();
});
</script>

<template>
    <v-row>
        <!-- Loading overlay -->
        <v-overlay v-model="isLoading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- Header Card -->
        <v-col cols="12" sm="12" lg="12">
            <v-card elevation="10" style="border-radius: 20px; height: 4em">
                <div class="d-flex align-center justify-space-between px-4" style="height: 100%">
                    <h4 class="m-0">{{ t('Financial Management') }}</h4>
                    <v-btn icon @click="openPopup" size="32" variant="text">
                        <PlusIcon stroke-width="1.5" size="35"  />
                    </v-btn>
                </div>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Total') }} {{ t('Income') }}</h6>
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Total') }} {{ t('Outcome') }}</h6>
                            <h4 class="text-h4 font-weight-bold">{{ formatCurrency(summary.total_outcome) }}</h4>
                           
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
                            <h6 class="text-subtitle-1 mb-1">{{ t('Balance') }}</h6>
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
                            <h5 class="text-h6 font-weight-semibold">{{ t('Monthly Financials Trend') }}</h5>
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
                        <p>{{ t('No monthly data available')}}</p>
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
                                height="195"
                                :options="categoryChartOptions.incomePieOptions.chartOptions"
                                :series="categoryChartOptions.incomePieOptions.series"
                            ></apexchart>
                        </div>
                        <div>
                            <apexchart
                                type="donut"
                                height="195"
                                :options="categoryChartOptions.outcomePieOptions.chartOptions"
                                :series="categoryChartOptions.outcomePieOptions.series"
                            ></apexchart>
                        </div>
                    </div>
                    <div v-else class="text-center py-8">
                        <p>{{ t('No category data available') }}</p>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- financials Entries Tabs -->
        <v-col cols="12">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div>
                            <h5 class="text-h6 font-weight-semibold">{{ t('Financials Entries')}}</h5>
                        </div>
                        <div>
                            <v-btn-toggle v-model="activeTab" mandatory>
                                <v-btn value="all" color="primary" variant="text">{{ t('All')}}</v-btn>
                                <v-btn value="income" color="success" variant="text">{{ t('Income')}}</v-btn>
                                <v-btn value="outcome" color="error" variant="text">{{ t('Outcome')}}</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>

                    <v-table>
                        <thead>
                            <tr>
                                <th>{{ t('Date') }}</th>
                                <th>{{ t('Description') }}</th>
                                <th>{{ t('Category') }}</th>
                                <th>{{ t('Amount') }}</th>
                                <th>{{ t('Type') }}</th>
                                <th>{{ t('Actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredfinancialsData" :key="item.id">
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
                                    <v-btn icon variant="text" color="error" @click="deletefinancials(item.id)">
                                        <TrashIcon stroke-width="1.5" size="20" />
                                    </v-btn>
                                </td>
                            </tr>
                            <tr v-if="filteredfinancialsData.length === 0">
                                <td colspan="6" class="text-center py-4">{{ t('No entries found')}}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-item>
            </v-card>
        </v-col>

        <!-- Add financials Popup -->
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopupp" class="popup-card" style="z-index: 10">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>{{ t('Add')}} {{ t('Income') }} / {{ t('Outcome') }}</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <fieldset class="field1">
                            <div class="inputGroup">
                                <input type="text" id="Description" v-model="financialsForm.description" autocomplete="off" />
                                <label for="Description">{{ t('Description')}}</label>
                            </div>
                        </fieldset>
                        <fieldset class="field2">
                            <div class="inputGroup">
                                <input type="number" id="Amount" v-model="financialsForm.amount" autocomplete="off" />
                                <label for="Amount">{{ t('Amount')}}</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <select id="type" v-model="financialsForm.type" class="select-input">
                                    <option value="" disabled>{{ t('Select')}} Type</option>
                                    <option value="income">{{ t('Income')}}</option>
                                    <option value="outcome">{{ t('Outcome')}}</option>
                                </select>
                                <label for="type">{{ t('Type')}}</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <select id="category" v-model="financialsForm.category" class="select-input">
                                    <option value="" disabled>{{ t('Select')}} {{ t('Category')}}</option>
                                    <option v-for="(option, index) in categoryOptions" :key="index" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <label for="category">{{ t('Category')}}</label>
                            </div>
                        </fieldset>
                        <fieldset class="field3">
                            <div class="inputGroup">
                                <input type="date" v-model="financialsForm.date" autocomplete="off" />
                                <label for="date">Date</label>
                            </div>
                        </fieldset>

                        <v-btn :color="financialsForm.type === 'income' ? 'primary' : 'error'" type="submit" id="add">
                            {{ t('add') }} {{ financialsForm.type === 'income' ? t('Income') : t('Outcome') }}
                        </v-btn>
                        <v-btn id="add" class="cancel-btn" @click="resetForm">{{ t('cancel')}}</v-btn>
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
.inputGroup input,
.inputGroup .select-input {
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
.inputGroup input:focus,
.inputGroup .select-input:focus {
    border-color: #2196f3;
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
