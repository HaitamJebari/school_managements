<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { PlusIcon } from 'vue-tabler-icons';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { PencilIcon } from 'vue-tabler-icons';
import { TrashIcon } from 'vue-tabler-icons';
import { SearchIcon } from 'vue-tabler-icons';
import Swal from 'sweetalert2';

// Access the Vue I18n instance
const { locale, t } = useI18n(); // Must be called first!

const students = ref([]);

// Function to change the language
const changeLanguage = (lang: string) => {
    locale.value = lang;
};

const showInput = ref(false); // Reactive property for input visibility

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

const errorMessage = ref('');

const showUpdateDialog = ref(false);

const searchQuery = ref('');

// ------------------------------------------------------Class------------------------------------------------------

interface ClassItem {
    name: string;
    number: number;
    bgColor: string;
}
const classForm = ref<{ name: string; number: number | string }>({
    name: '',
    number: ''
});
const classes = ref<ClassItem[]>([]);


const addClass = async () => {
    try {
        const response = await axios.post('http://localhost:5000/classes', {
            name: classForm.value.name,
            number: Number(classForm.value.number)
        });

        // The backend now returns the class with its random color
        classes.value.push(response.data);

        Swal.fire({
            icon: 'success',
            title: 'Class added successfully!',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success' // Add a green class for the button
            },
        });

        classForm.value = { name: '', number: '' };
        closePopup();
    } catch (error) {
        console.error('Error adding class:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to add class',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    }
};

// Update fetchClasses to use backend-provided colors
const fetchClasses = async () => {
    try {
        const response = await axios.get('http://localhost:5000/classes');
        classes.value = response.data.map((cls) => ({
            ...cls,
            bgColor: cls.bgColor || cls.bg_color // Handle both cases
        }));
        console.log('Classes after fetch:', classes.value); // Debug
    } catch (error) {
        console.error('Error fetching classes:', error);
    }
};
const submitForm = () => {
    addClass();
};
const resetForm1 = () => {
    classForm.value = { name: '', number: '' };
};
onMounted(async () => {
    console.log('Fetching classes...');
    await fetchClasses();
    console.log('Classes fetched:', classes.value);
});

//delete class
const showConfirmationDialog = (classesId: number) => {
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
                    const response = await axios.delete(`http://localhost:5000/classes/${classesId}`);
                    if (response.status === 200) {
                        swalWithBootstrapButtons.fire({
                            title: 'Deleted!',
                            text: 'The Class has been deleted successfully.',
                            
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // Update the local list of class
                        classes.value = classes.value.filter((classes) => classes.id !== classesId);
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


</script>
<template>
    <v-row class="mt-5">
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card class="d-flex align-center justify-center" style="height: 10vh; width: 10vh; border-radius: 50%">
                <v-btn icon color="white" @click="openPopup" size="80" flat>
                    <PlusIcon stroke-width="1.5" size="60" style="color: grey" />
                </v-btn>
            </v-card>
        </v-col>
        <v-col v-for="(classItem, index) in classes" :key="classItem.id" cols="12" sm="12" lg="4">
            <v-card :style="{ backgroundColor: classItem.bgColor }" style="border-radius: 20px;">
                <v-btn
                    :style="{ backgroundColor: classItem.bgColor }"
                    icon
                    @click="showConfirmationDialog(classItem.id)"
                    style="position: absolute; right: 10px; top: 10px; z-index: 10"
                >
                    <TrashIcon stroke-width="1.5" size="24" />
                </v-btn>

                <div class="inside-card">
                    <h4>{{ classItem.name }} {{ classItem.number || 0 }}</h4>
                </div>
                <div class="total">
                    <h1>{{ Math.floor(Math.random() * 8) }}</h1>
                    <div class="images">
                        <img src="../../assets/images/profile/user-4.jpg" alt="" srcset="" />
                        <img src="../../assets/images/profile/user-5.jpg" id="img2" alt="" srcset="" />
                        <img src="../../assets/images/profile/user-6.jpg" alt="" srcset="" />
                    </div>
                </div>
            </v-card>
        </v-col>

        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            

            <v-card elevation="0" v-if="showPopupp" class="popup-card">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add New Class</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" v-bind="props" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <div class="formContainer">
                            <fieldset class="field1">
                                <div class="inputGroup">
                                    <input type="text" v-model="classForm.name" autocomplete="off" />
                                    <label for="name">{{ t('Classe Name') }}</label>
                                </div>
                            </fieldset>
                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <input type="number" v-model="classForm.number" autocomplete="off" />
                                    <label for="name">{{ t('Classe Number') }}</label>
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

<style>
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
#xicon {
}
#add {
    width: 20%;
    margin: 3px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
