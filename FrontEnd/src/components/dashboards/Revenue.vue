<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
  balance: 0
});
const monthlyData = ref([]);
const categoryData = ref([]);

// Computed properties for filtered data
const filteredRevenueData = computed(() => {
  if (activeTab.value === 'all') {
    return revenueData.value;
  } else {
    return revenueData.value.filter(item => item.type === activeTab.value);
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
  }
};

// Fetch revenue summary
const fetchRevenueSummary = async () => {
  try {
    const response = await axios.get('http://localhost:5000/revenue/summary');
    summary.value = response.data.summary;
    monthlyData.value = response.data.monthly;
    categoryData.value = response.data.categories;
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
       customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
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
          const response = await axios.delete(`http://localhost:5000/revenue/${id}`);
          if (response.status === 200) {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: 'The revenue entry has been deleted successfully.',
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
  const months = monthlyData.value.map(item => item.month);
  const incomeData = monthlyData.value.map(item => parseFloat(item.income));
  const outcomeData = monthlyData.value.map(item => parseFloat(item.outcome));
  
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
    .filter(item => item.type === 'income')
    .map(item => ({ name: item.category || 'Uncategorized', value: parseFloat(item.total) }));
  
  const outcomeCategories = categoryData.value
    .filter(item => item.type === 'outcome')
    .map(item => ({ name: item.category || 'Uncategorized', value: parseFloat(item.total) }));
  
  return {
    incomePieOptions: {
      series: incomeCategories.map(item => item.value),
      chartOptions: {
        chart: {
          type: 'donut',
          height: 240
        },
        labels: incomeCategories.map(item => item.name),
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
      series: outcomeCategories.map(item => item.value),
      chartOptions: {
        chart: {
          type: 'donut',
          height: 240
        },
        labels: outcomeCategories.map(item => item.name),
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

onMounted(async () => {
  await fetchRevenueData();
  await fetchRevenueSummary();
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
              <h5 class="text-h5 mb-1 font-weight-semibold">Revenue Management</h5>
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
      <v-card elevation="10" style="border-radius: 20px; background-color: #4CAF50; color: white">
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
      <v-card elevation="10" style="border-radius: 20px; background-color: #F44336; color: white">
        <v-card-item>
          <div class="d-flex align-center">
            <div class="mr-4">
              <CreditCardIcon stroke-width="1.5" size="48" />
            </div>
            <div>
              <h6 class="text-subtitle-1 mb-1">Total Outcome</h6>
              <h4 class="text-h4 font-weight-bold">{{ formatCurrency(summary.total_outcome) }}</h4>
            </div>
          </div>
        </v-card-item>
      </v-card>
    </v-col>

    <v-col cols="12" sm="12" md="4">
      <v-card elevation="10" style="border-radius: 20px; background-color: #2196F3; color: white">
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
              <h5 class="text-h6 font-weight-semibold">Monthly Revenue Trend</h5>
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
              <h5 class="text-h6 font-weight-semibold">Revenue Entries</h5>
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
                  <v-chip
                    :color="item.type === 'income' ? 'success' : 'error'"
                    text-color="white"
                    size="small"
                  >
                    {{ item.type.charAt(0).toUpperCase() + item.type.slice(1) }}
                  </v-chip>
                </td>
                <td>
                  <v-btn icon color="error" size="small" @click="deleteRevenue(item.id)">
                    <TrashIcon stroke-width="1.5" size="16" />
                  </v-btn>
                </td>
              </tr>
              <tr v-if="filteredRevenueData.length === 0">
                <td colspan="6" class="text-center py-4">No revenue entries found</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-item>
      </v-card>
    </v-col>

    <!-- Add Revenue Popup -->
    <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
      <v-card elevation="0" v-if="showPopupp" class="popup-card" style="z-index: 10;">
        <div class="popup-contentp">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <v-card-title class="title" style="margin: 10px auto; text-align: center">
              <h1>Add Revenue </h1>
            </v-card-title>
            <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
              <XIcon stroke-width="1.5" size="24" class="text-grey100" />
            </v-btn>
          </div>
          <form @submit.prevent="submitForm">
            <div class="formContainer">
              <fieldset class="field1">
                <div class="inputGroup">
                  <input type="text" id="description" v-model="revenueForm.description" autocomplete="off" />
                  <label for="description">{{ t('Description') }}</label>
                </div>
              </fieldset>
              <fieldset class="field2">
                <div class="inputGroup">
                  <input type="number" id="amount" v-model="revenueForm.amount" autocomplete="off" step="0.01" min="0" />
                  <label for="amount">{{ t('Amount') }}</label>
                </div>
              </fieldset>
              <fieldset class="field3">
                <div class="inputGroup">
                  <select id="type" v-model="revenueForm.type" autocomplete="off">
                    <option value="income">Income</option>
                    <option value="outcome">Outcome</option>
                  </select>
                  <label for="type">{{ t('Type') }}</label>
                </div>
              </fieldset>
              <fieldset class="field4">
                <div class="inputGroup">
                  <select id="category" v-model="revenueForm.category" autocomplete="off">
                    <option value="">Select Category</option>
                    <option v-for="(option, index) in categoryOptions" :key="index" :value="option">
                      {{ option }}
                    </option>
                  </select>
                  <label for="category">{{ t('Category') }}</label>
                </div>
              </fieldset>
              <fieldset class="field5">
                <div class="inputGroup">
                  <input type="date" id="date" v-model="revenueForm.date" autocomplete="off" />
                  <label for="date">{{ t('Date') }}</label>
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
    height: 67vh;
    margin-top: 80px;
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
  position: relative;
  margin-bottom: 1em;
}
.inputGroup input, .inputGroup select {
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
.inputGroup input:focus, .inputGroup select:focus {
  border-color: #2196F3;
  outline: none;
}
#add {
  margin-right: 10px;
}
.text-success {
  color: #4CAF50 !important;
}
.text-error {
  color: #F44336 !important;
}
</style>
