<script setup lang="ts">
import { ChevronRightIcon, PlusIcon } from 'vue-tabler-icons';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { PencilIcon } from 'vue-tabler-icons';
import { TrashIcon } from 'vue-tabler-icons';
import { SearchIcon } from 'vue-tabler-icons';
import Swal from 'sweetalert2';

// Access the Vue I18n instance
const { locale, t } = useI18n(); // Must be called first!

const teachers = ref([]);
const items = ref([{ title: 'Action' }, { title: 'Another action' }, { title: 'Something else here' }]);

const fetchTeachers = async () => {
    try {
        const response = await axios.get('http://localhost:5000/teachers');
        teachers.value = response.data;
    } catch (error) {
        console.error('Error fetching teachers:', error);
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
        return formatDate(form2.value.date_registration);
    },
    set(value) {
        // Parse the input date back to the model's format
        form2.value.date_registration = parseDate(value);
    }
});

onMounted(() => {
    fetchTeachers();
});

// Function to change the language
const changeLanguage = (lang: string) => {
    locale.value = lang;
};

const showInput = ref(false); // Reactive property for input visibility

// Function to toggle the input field
const toggleInput = () => {
    showInput.value = !showInput.value;
};





// Simulated async fetch function
const fetchData = () =>
    new Promise((resolve) => {
        setTimeout(() => resolve('This is the content loaded asynchronously!'), 2000);
    });


const form2 = ref({
    cin: '',
    fullname: '',
    email: '',
    date_registration: '',
    tel: null,
    adresse: ''
});







const searchQuery = ref(''); // Reactive property for the search query

// Computed property for filtered teachers
const filteredTeachers = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return teachers.value.filter(
        (teacher) => teacher.fullname.toLowerCase().includes(query) || teacher.adresse.toLowerCase().includes(query)
    );
});
</script>
<template>
    <v-card elevation="10" class="pb-2 mt-4">
        <v-card-item class="pa-6">
            <div class="d-flex align-center justify-space-between">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">Teachers</h5>
                </div>
                <div>
                    <!-- Transition for sliding effect -->
                    <transition name="slide">
                        <!-- Input field that appears conditionally -->
                        <input v-if="showInput" type="text" v-model="searchQuery" class="animated-input" placeholder="Search here..." />
                    </transition>
                    <v-btn icon color="inherit" @click="toggleInput" flat>
                        <SearchIcon stroke-width="1.5" size="24" class="text-grey100" />
                    </v-btn>
                    <!-- Button to trigger popup -->
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
            <v-table class="month-table" style="max-height: 580px;">
                <thead>
                    <tr>
                        <th class="text-subtitle-1 font-weight-bold">Cin</th>
                        <th class="text-subtitle-1 font-weight-bold">Fullname</th>
                        <th class="text-subtitle-1 font-weight-bold">Email</th>
                        <th class="text-subtitle-1 font-weight-bold">Date Registration</th>
                        <th class="text-subtitle-1 font-weight-bold">Tel</th>
                        <th class="text-subtitle-1 font-weight-bold">Adresse</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="teacher in filteredTeachers" :key="teacher.id">
                        <td>{{ teacher.cin }}</td>
                        <td>{{ teacher.fullname }}</td>
                        <td>{{ teacher.email }}</td>
                        <td>{{ teacher.date_registration }}</td>
                        <td>{{ teacher.tel }}</td>
                        <td>{{ teacher.adresse }}</td>
                        <td>
                        </td>
                    </tr>
                </tbody>
            </v-table>
             <a href="ui/teachers" ><ChevronRightIcon :size="20" stroke-width="2" color="blue" />Modify Teachers</a>
        </v-card-item>
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
    height: 70vh;
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
