<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import { SearchIcon } from 'vue-tabler-icons';

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
    const date = new Date(datetime);
    return date.toLocaleDateString();
};

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

// Function to toggle the popup
const togglePopup = (id = null) => {
  studentToDelete.value = id; // Set the student ID to delete, if provided
  showPopup.value = !showPopup.value;
};



// Handle the delete confirmation
const confirmDelete = async () => {
  if (studentToDelete.value) {
    try {
      const response = await axios.delete(
        `http://localhost:5000/students/${studentToDelete.value}`
      );

      if (response.status === 200) {
        console.log('Student deleted successfully');

        // Remove the deleted student from the local students list
        students.value = students.value.filter(
          (student) => student.id !== studentToDelete.value
          
        );

      } else {
        console.error('Failed to delete student:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      showPopup.value = false; // Close the popup
      studentToDelete.value = null; // Reset studentToDelete
    }
  }
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
    <v-card elevation="10" class="pb-2">
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
            <v-table class="month-table" style="max-height: 580px; ">
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
                        
                    </tr>
                </tbody>

            </v-table>
             <a href="ui/students" ><ChevronRightIcon :size="20" stroke-width="2" color="blue" />Modify Students</a>
        </v-card-item>
    </v-card>
</template>
<style scoped>
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
</style>
