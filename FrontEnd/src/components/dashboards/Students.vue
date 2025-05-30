<script setup lang="ts">
import { PlusIcon } from 'vue-tabler-icons';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { PencilIcon } from 'vue-tabler-icons';
import { TrashIcon } from 'vue-tabler-icons';
import { SearchIcon } from 'vue-tabler-icons';
import Swal from 'sweetalert2';

// Access the Vue I18n instance
const { locale, t } = useI18n(); // Must be called first!

const students = ref([]);
const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const fetchStudents = async () => {
    try {
        const response = await axios.get('http://localhost:5000/students');
        students.value = response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
    }
};

const formatDate = (datetime: string) => {
    if (!datetime) return ''; // Handle empty or null values
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Two-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Two-digit day
    return `${year}-${month}-${day}`; // Return in YYYY-MM-DD format
};

const parseDate = (dateString: string) => {
    if (!dateString) return ''; // Handle empty or null values
    return new Date(dateString).toISOString(); // Convert to full ISO format if needed
};

const formattedDate = computed({
    get() {
        // Format the date to YYYY-MM-DD for the input field
        return formatDate(form2.value.inscription_date);
    },
    set(value) {
        // Parse the input date back to the model's format
        form2.value.inscription_date = parseDate(value);
    }
});

onMounted(() => {
    fetchStudents();
});

// Function to change the language
const changeLanguage = (lang: string) => {
    locale.value = lang;
};

const showInput = ref(false); // Reactive property for input visibility
const showPopup = ref(false); // Reactive property for popup visibility
const studentToDelete = ref(null); // Stores the ID of the student to delete

// Function to toggle the input field
const toggleInput = () => {
    showInput.value = !showInput.value;
};

// Reactive variables
const showPopupp = ref(false);
const popupMessage = ref('Loading...');

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
// Close popup_update method
const closePopup_up = () => {
    showUpdateDialog.value = false; // Close the popup
};

// Simulated async fetch function
const fetchData = () =>
    new Promise((resolve) => {
        setTimeout(() => resolve('This is the content loaded asynchronously!'), 2000);
    });

const showConfirmationDialog = (studentId: number) => {
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
                    const response = await axios.delete(`http://localhost:5000/students/${studentId}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: 'The student has been deleted successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK' // Corrected text for the button
                        });
                        // Update the local list of students
                        students.value = students.value.filter((student) => student.id !== studentId);
                    } else {
                        swalWithBootstrapButtons.fire({
                            title: 'Failed!',
                            text: 'Failed to delete the teacher.',
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

//Add new student

const form1 = ref({
    id: '',
    first_name: '',
    last_name: '',
    adresse: '',
    age: null,
    parent_name: '',
    parent_tel: null,
    inscription_date: '',
    price: null,
    email: ''
});
const form2 = ref({
    id: '',
    first_name: '',
    last_name: '',
    adresse: '',
    age: null,
    parent_name: '',
    parent_tel: null,
    inscription_date: '',
    price: null,
    email: ''
});

const errorMessage = ref('');

const submitForm = async () => {
    try {
        console.log('Submitting form data:', form1.value); // Log form data
        const response = await axios.post('http://localhost:5000/add', form1.value);

        // Add the newly created student to the local list
        students.value.push({ ...form1.value });

        Swal.fire({
            title: 'Student added successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
            buttonsStyling: false // Disable default styling to apply your custom class
        });
        resetForm1();
    } catch (error) {
        console.error('Error submitting form:', error.response?.data || error.message);
        Swal.fire({
            icon: 'error',
            title: 'Failed to add Student',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-danger' // Red button class
            },
            buttonsStyling: false // Disable default styling to apply your custom styles
        });
    }
};

const resetForm1 = () => {
    form1.value = {
        id: '',
        first_name: '',
        last_name: '',
        adresse: '',
        age: null,
        parent_name: '',
        parent_tel: null,
        inscription_date: '',
        price: null,
        email: ''
    };
};
const resetForm2 = () => {
    form2.value = {
        id: '',
        first_name: '',
        last_name: '',
        adresse: '',
        age: null,
        parent_name: '',
        parent_tel: null,
        inscription_date: '',
        price: null,
        email: ''
    };
};

//update student
const updateStudent = async (studentId) => {
    try {
        const response = await axios.put(`http://localhost:5000/students/${studentId}`, form2.value);
        Swal.fire({
            title: response.data.message || 'Student updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success'
            }
        });

        // Refresh the student list after update
        fetchStudents();
    } catch (error) {
        Swal.fire({
            title: 'Error updating student',
            text: error.response?.data?.error || 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-danger'
            }
        });
    }
};

const showUpdateDialog = ref(false);

const openUpdatePopup = (student) => {
    form2.value = { ...student }; // Populate the form with the selected student's data
    showUpdateDialog.value = true; // Show the dialog
};

const searchQuery = ref(''); // Reactive property for the search query

// Computed property for filtered students
const filteredStudents = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return students.value.filter(
        (student) =>
            student.first_name.toLowerCase().includes(query) ||
            student.last_name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.parent_name.toLowerCase().includes(query) ||
            student.adresse.toLowerCase().includes(query)
    );
});
</script>

<template>
    <v-card elevation="10" class="pb-2 mt-4">
        <v-card-item class="pa-6">
            <div class="d-flex align-center justify-space-between">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">{{ t('Students') }}</h5>
                </div>
                <div>
                    <!-- Transition for sliding effect -->
                    <transition name="slide">
                        <!-- Input field that appears conditionally -->
                        <input v-if="showInput" type="text" v-model="searchQuery" class="animated-input" placeholder="Search here..." />
                    </transition>
                    <v-btn icon color="inherit" flat @click="toggleInput">
                        <SearchIcon stroke-width="1.5" size="24" class="text-grey100" />
                    </v-btn>
                    <!-- Button to trigger popup -->
                    <v-btn icon color="inherit" flat @click="openPopup">
                        <PlusIcon stroke-width="1.5" size="24" class="text-grey100" />
                    </v-btn>

                    <!-- Popup Card -->
                    <v-card elevation="0" v-if="showPopupp" class="popup-card">
                        <div class="popup-contentp">
                            <div style="display: flex; justify-content: space-between; align-items: center">
                                <v-card-title class="title" style="margin: 10px auto; text-align: center">
                                    <h1>Add New Student</h1>
                                </v-card-title>
                                <v-btn icon color="inherit" v-bind="props" @click="closePopup" flat style="transform: translateY(-30px)">
                                    <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                                </v-btn>
                            </div>
                            <form @submit.prevent="submitForm">
                                <div class="formContainer">
                                    <fieldset class="field1">
                                        <div class="inputGroup">
                                            <input type="text" v-model="form1.id" autocomplete="off" />
                                            <label for="name">{{ t('Id') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="text" v-model="form1.first_name" autocomplete="off" />
                                            <label for="name">{{ t('First Name') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="text" v-model="form1.last_name" autocomplete="off" />
                                            <label for="name">{{ t('Last Name') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="text" v-model="form1.adresse" autocomplete="off" />
                                            <label for="name">{{ t('Adresse') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="number" v-model="form1.age" autocomplete="off" />
                                            <label for="name">{{ t('Age') }}</label>
                                        </div>
                                    </fieldset>
                                    <fieldset class="field2">
                                        <div class="inputGroup">
                                            <input type="text" v-model="form1.parent_name" autocomplete="off" />
                                            <label for="name">{{ t('Parent') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="number" v-model="form1.parent_tel" autocomplete="off" />
                                            <label for="name">{{ t('Parent Tel') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="date" v-model="form1.inscription_date" autocomplete="off" />
                                        </div>
                                        <div class="inputGroup">
                                            <input type="number" v-model="form1.price" autocomplete="off" />
                                            <label for="name">{{ t('Price') }}</label>
                                        </div>
                                        <div class="inputGroup">
                                            <input type="email" v-model="form1.email" autocomplete="off" />
                                            <label for="name">{{ t('Email') }}</label>
                                        </div>
                                    </fieldset>
                                </div>
                                <v-btn color="primary" type="submit" id="add">Add</v-btn>
                                <v-btn id="add" @click="resetForm1">Cancel</v-btn>
                            </form>
                        </div>
                    </v-card>

                    <!-- <v-menu bottom left>
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
                    </v-menu> -->
                </div>
            </div>
            <v-table class="month-table" style="max-height: 580px">
                <thead>
                    <tr>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Id') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('First Name') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Last Name') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Parent') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Parent Tel') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Adresse') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Email') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Age') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Inscription Date') }}</th>
                        <th class="text-subtitle-1 font-weight-bold">{{ t('Price') }}</th>
                        <th style="text-align: center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in filteredStudents" :key="student.id">
                        <td>{{ student.id }}</td>
                        <td>{{ student.first_name }}</td>
                        <td>{{ student.last_name }}</td>
                        <td>{{ student.parent_name }}</td>
                        <td>{{ student.parent_tel }}</td>
                        <td>{{ student.adresse }}</td>
                        <td>{{ student.email }}</td>
                        <td>{{ student.age }}</td>
                        <td>{{ formatDate(student.inscription_date) }}</td>
                        <td>{{ student.price }}</td>
                        <td>
                            <div class="d-flex justify-content-center">
                                <v-btn class="d-flex align-center" icon color="inherit" v-bind="props" style="gap: 12px" flat>
                                    <PencilIcon stroke-width="1.5" size="24" class="text-grey100" @click="openUpdatePopup(student)" />
                                </v-btn>
                                <div>
                                    <!-- Button to trigger the popup -->
                                    <v-btn
                                        class="d-flex align-center"
                                        icon
                                        color="inherit"
                                        v-bind="props"
                                        style="gap: 12px"
                                        flat
                                        @click="showConfirmationDialog(student.id)"
                                    >
                                        <TrashIcon stroke-width="1.5" size="24" class="text-grey100" />
                                    </v-btn>
                                </div>
                                <!-- <template>
                                    <vue-modal-2 name="modal-1" @on-close="close"> Hello From Inside Modal Component </vue-modal-2>
                                </template> -->
                            </div>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-card-item>

        <v-card elevation="0" v-if="showUpdateDialog" class="popup-card">
            <div class="popup-contentp">
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <v-card-title class="title" style="margin: 10px auto; text-align: center">
                        <h1>Edit Student</h1>
                    </v-card-title>
                    <v-btn icon color="inherit" v-bind="props" @click="closePopup_up" flat style="transform: translateY(-30px)">
                        <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                    </v-btn>
                </div>
                <form @submit.prevent="updateStudent(form2.id)">
                    <div class="formContainer">
                        <fieldset class="field1">
                            <div class="inputGroup">
                                <input type="text" v-model="form2.id" required="" autocomplete="off" />
                                <label for="name">{{ t('Id') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="text" v-model="form2.first_name" required="" autocomplete="off" />
                                <label for="name">{{ t('First Name') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="text" v-model="form2.last_name" required="" autocomplete="off" />
                                <label for="name">{{ t('Last Name') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="text" v-model="form2.adresse" required="" autocomplete="off" />
                                <label for="name">{{ t('Adresse') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="number" v-model="form2.age" required="" autocomplete="off" />
                                <label for="name">{{ t('Age') }}</label>
                            </div>
                        </fieldset>
                        <fieldset class="field2">
                            <div class="inputGroup">
                                <input type="text" v-model="form2.parent_name" required="" autocomplete="off" />
                                <label for="name">{{ t('Parent') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="number" v-model="form2.parent_tel" required="" autocomplete="off" />
                                <label for="name">{{ t('Parent Tel') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="date" v-model="formattedDate" required="" autocomplete="off" />
                            </div>
                            <div class="inputGroup">
                                <input type="number" v-model="form2.price" required="" autocomplete="off" />
                                <label for="name">{{ t('Price') }}</label>
                            </div>
                            <div class="inputGroup">
                                <input type="email" v-model="form2.email" required="" autocomplete="off" />
                                <label for="name">{{ t('Email') }}</label>
                            </div>
                        </fieldset>
                    </div>
                    <v-btn color="primary" @click="updateStudent(form2.id)" id="add">Update</v-btn>
                    <v-btn id="add" @click="resetForm2">Cancel</v-btn>
                </form>
            </div>
        </v-card>
    </v-card>
</template>
<style scoped>
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
#xicon {
}
#add {
    width: 20%;
    margin: 3px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
