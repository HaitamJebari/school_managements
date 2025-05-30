<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { DotsVerticalIcon, TrashIcon, PlusIcon, XIcon } from 'vue-tabler-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n(); // Must be called first!

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');

// List of modules for the select dropdown
const moduleOptions = [
  'Arabe',
  'Français',
  'Anglais',
  'Mathématiques',
  'Sciences de la Vie et de la Terre (SVT)',
  'Physique-Chimie',
  'Histoire-Géographie',
  'Éducation Islamique',
  'Philosophie',
  'Éducation Physique et Sportive (EPS)',
  'Technologie',
  'Informatique',
  'Arts Plastiques / Musique'
];

// Fetch data function that was missing
const fetchData = async (): Promise<string> => {
    // This is a placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    return "Data loaded successfully";
};

// Open popup method
const openPopup = async () => {
    showPopupp.value = true; // Show the popup
    try {
        const data = await fetchData();
        popupMessage.value = data;
    } catch (error) {
        popupMessage.value = 'Failed to load data.';
        console.error(error);
        // Added user-friendly error notification
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load data. Please try again.',
            confirmButtonText: 'OK'
        });
    }
};

// Close popup_add method
const closePopup = () => {
    showPopupp.value = false; // Close the popup
};

const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const error = theme.current.value.colors.error;

// ------------------------------------------------------Exams------------------------------------------------------

interface ExamItem {
    id: number;
    module_name: string;
    numero_control: string;
    date_exam: string;
    bgColor: string;
}

const examForm = ref<{ module_name: string; numero_control: string; date_exam: string }>({
    module_name: moduleOptions[0], // Default to first option
    numero_control: '',
    date_exam: ''
});

const exams = ref<ExamItem[]>([]);

const addExam = async () => {
    // Added form validation
    if (!examForm.value.module_name || !examForm.value.numero_control || !examForm.value.date_exam) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'All fields are required',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/exams', {
            module_name: examForm.value.module_name,
            numero_control: examForm.value.numero_control,
            date_exam: examForm.value.date_exam
        });

        // The backend now returns the exam with its random color
        exams.value.push(response.data);

        Swal.fire({
            icon: 'success',
            title: 'Exam added successfully!',
             customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
        });

        examForm.value = { module_name: moduleOptions[0], numero_control: '', date_exam: '' };
        closePopup();
    } catch (error: any) {
        console.error('Error adding exam:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to add exam',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    }
};

// Update fetchExams to use backend-provided colors
const fetchExams = async () => {
    try {
        const response = await axios.get('http://localhost:5000/exams');
        exams.value = response.data.map((exam: any) => ({
            ...exam,
            bgColor: exam.bgColor || exam.bg_color // Handle both cases
        }));
        console.log('Exams after fetch:', exams.value); // Debug
    } catch (error) {
        console.error('Error fetching exams:', error);
        // Added user-friendly error notification
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Failed to load exams. Please refresh the page.',
            confirmButtonText: 'OK'
        });
    }
};

const submitForm = () => {
    addExam();
};

const resetForm = () => {
    examForm.value = { module_name: moduleOptions[0], numero_control: '', date_exam: '' };
};

onMounted(async () => {
    console.log('Fetching exams...');
    await fetchExams();
    console.log('Exams fetched:', exams.value);
});

// Delete exam
const showConfirmationDialog = (examId: number) => {
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
                    const response = await axios.delete(`http://localhost:5000/exams/${examId}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: 'The Exam has been deleted successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // Update the local list of exams
                        exams.value = exams.value.filter((exam) => exam.id !== examId);
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: 'Failed!',
                            text: 'Failed to delete the Exam.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-danger'
                            }
                        });
                    }
                } catch (error: any) {
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

// Function to format date for display with proper TypeScript typing
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="12" class="mt-5">
            <v-card elevation="10" style="border-radius: 20px">
                <v-card-item>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h5 class="text-h5 mb-1  font-weight-semibold">Exams Management</h5>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
        
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card class="d-flex align-center justify-center" style="height: 10vh; width: 10vh; border-radius: 50%">
                <v-btn icon color="white" @click="openPopup" size="80" flat>
                    <PlusIcon stroke-width="1.5" size="60" style="color: grey" />
                </v-btn>
            </v-card>
        </v-col>
        
        <v-col v-for="(examItem, index) in exams" :key="examItem.id" cols="12" sm="12" lg="4">
            <v-card :style="{ backgroundColor: examItem.bgColor }" style="border-radius: 20px; height: 20vh; color: white; z-index: 0;">
                <v-btn
                    :style="{ backgroundColor: examItem.bgColor }"
                    icon
                    @click="showConfirmationDialog(examItem.id)"
                    style="position: absolute; right: 10px; top: 10px; z-index: 10"
                >
                    <TrashIcon stroke-width="1.5" size="24" />
                </v-btn>
                <div class="inside-card">
                    <h4>{{ examItem.module_name }}</h4>
                    <p>Control Number: {{ examItem.numero_control }}</p>
                    <p>Exam Date: {{ formatDate(examItem.date_exam) }}</p>
                </div>
            </v-card>
        </v-col>
        
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopupp" class="popup-card" style="z-index: 10;">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add New Exam</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <div class="formContainer">
                            <fieldset class="field1">
                                <div class="inputGroup">
                                    <select id="module_name" v-model="examForm.module_name" class="select-input">
                                        <option v-for="(option, index) in moduleOptions" :key="index" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <label for="module_name">{{ t('Module Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <input type="text" id="numero_control" v-model="examForm.numero_control" autocomplete="off" />
                                    <label for="numero_control">{{ t('Control Number') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field3">
                                <div class="inputGroup">
                                    <div class="el-date-picker">
                                                <el-date-picker
                                                    v-model="examForm.date_exam"
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
                                            </div>
                                </div>
                            </fieldset>
                        </div>
                        <v-btn color="primary" type="submit" id="add">Add</v-btn>
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
    height: 52vh;
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
