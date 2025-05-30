<script setup lang="ts">
import axios from 'axios';
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { TrashIcon, PlusIcon, XIcon, SearchIcon, BellIcon, CalendarIcon, UserIcon, EditIcon } from 'vue-tabler-icons';
import { format, parseISO } from 'date-fns';

// Reactive variables
const searchQuery = ref('');
const isSelectedAll = ref(false);
const selectedAnnouncements = ref<number[]>([]);
const showPopup = ref(false);
const loading = ref(false);
const filterOption = ref('all');



// Computed properties
const filteredAnnouncements = computed(() => {
    return announcements.value
        .filter((announcement) => {
            if (searchQuery.value === '') return true;
            return (
                announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                announcement.author_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                announcement.content.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

// Open popup method
const openPopup = () => {
    showPopup.value = true;
    announcementForm.value = { author_name: '', title: '', content: '' };
};

// Close popup method
const closePopup = () => {
    showPopup.value = false;
};

// Format date
const formatDate = (dateString) => {
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

// Format time
const formatTime = (dateString) => {
    try {
        return format(parseISO(dateString), 'h:mm a');
    } catch (error) {
        return '';
    }
};

interface AnnouncementItem {
    id: number;
    author_name: string;
    title: string;
    content: Text;
    created_at: string;
    selected: boolean;
}

const announcementForm = ref<{ author_name: string; title: string; content: Text | string }>({
    author_name: '',
    title: '',
    content: ''
});

const announcements = ref<AnnouncementItem[]>([]);

// Add announcement
const addAnnouncement = async () => {
    if (!announcementForm.value.author_name || !announcementForm.value.title || !announcementForm.value.content) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Please fill in all fields',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        loading.value = true;
        const response = await axios.post('http://localhost:5000/announcements', {
            author_name: announcementForm.value.author_name,
            title: announcementForm.value.title,
            content: announcementForm.value.content
        });

        // Add the new announcement with selected: false
        announcements.value.unshift({
            ...response.data,
            selected: false
        });

        Swal.fire({
            icon: 'success',
            title: 'Announcement Added',
            text: 'Your announcement has been published successfully',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success'
            }
        });

        announcementForm.value = { author_name: '', title: '', content: '' };
        closePopup();
    } catch (error) {
        console.error('Error adding announcement:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to Add Announcement',
            text: error.response?.data?.message || 'An error occurred',
            confirmButtonText: 'OK'
        });
    } finally {
        loading.value = false;
    }
};

// Fetch announcements
const fetchData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('http://localhost:5000/announcements');
        announcements.value = response.data.map((item: any) => ({
            ...item,
            selected: false
        }));
    } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to Load Announcements',
            text: 'Please try again later',
            confirmButtonText: 'OK'
        });
    } finally {
        loading.value = false;
    }
};

const submitForm = () => {
    addAnnouncement();
};

const resetForm = () => {
    announcementForm.value = { author_name: '', title: '', content: '' };
};

onMounted(async () => {
    console.log('Fetching Announcements...');
    await fetchData();
    console.log('Announcements fetched:', announcements.value);
});

// Toggle selection for single announcement
const toggleSelection = (id: number) => {
    const announcement = announcements.value.find((item) => item.id === id);
    if (announcement) {
        announcement.selected = !announcement.selected;
        if (announcement.selected) {
            selectedAnnouncements.value.push(id);
        } else {
            selectedAnnouncements.value = selectedAnnouncements.value.filter((itemId) => itemId !== id);
        }
    }
    isSelectedAll.value = selectedAnnouncements.value.length === announcements.value.length && announcements.value.length > 0;
};

// Toggle select all
const toggleSelectAll = () => {
    isSelectedAll.value = !isSelectedAll.value;
    announcements.value.forEach((announcement) => {
        announcement.selected = isSelectedAll.value;
    });

    selectedAnnouncements.value = isSelectedAll.value ? announcements.value.map((a) => a.id) : [];
};

// Delete announcement
const showConfirmationDialog = (announcementId: number) => {
    Swal.fire({
        title: 'Delete Announcement?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                loading.value = true;
                const response = await axios.delete(`http://localhost:5000/announcements/${announcementId}`);

                if (response.status === 200) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The announcement has been deleted successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    // Update the local list of announcements
                    announcements.value = announcements.value.filter((announcement) => announcement.id !== announcementId);
                    selectedAnnouncements.value = selectedAnnouncements.value.filter((id) => id !== announcementId);
                    isSelectedAll.value =
                        selectedAnnouncements.value.length === announcements.value.length && announcements.value.length > 0;
                } else {
                    Swal.fire({
                        title: 'Failed!',
                        text: 'Failed to delete the announcement.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong during deletion.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                loading.value = false;
            }
        }
    });
};

// Delete selected announcements
const deleteSelectedAnnouncements = async () => {
    if (!selectedAnnouncements.value.length) return;

    Swal.fire({
        title: `Delete ${selectedAnnouncements.value.length} announcements?`,
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                loading.value = true;
                // Delete all selected announcements
                await Promise.all(selectedAnnouncements.value.map((id) => axios.delete(`http://localhost:5000/announcements/${id}`)));

                // Remove deleted announcements from the list
                announcements.value = announcements.value.filter((announcement) => !selectedAnnouncements.value.includes(announcement.id));

                // Reset selection
                selectedAnnouncements.value = [];
                isSelectedAll.value = false;

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Announcements deleted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (error) {
                console.error('Error deleting announcements:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete some announcements.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                loading.value = false;
            }
        }
    });
};

// Truncate text
const truncateText = (text, length = 150) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

// Get random avatar color
const getAvatarColor = (name) => {
    const colors = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-purple', 'bg-pink'];

    // Generate a consistent index based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
</script>

<template>
    <div class="announcements-container">
        <!-- Header with search and actions -->
        <v-card elevation="3" class="header-card mb-6">
            <v-card-item>
                <div class="d-flex flex-wrap align-center justify-space-between gap-4">
                    <!-- Left side: Title and search -->
                    <div class="d-flex flex-column flex-sm-row align-start align-sm-center gap-4">
                        <!-- <h2 class="text-h4 font-weight-bold text-primary mb-0">
              <BellIcon class="me-2" />Announcements
            </h2> -->

                        <div class="search-container">
                            <div class="search-wrapper">
                                <SearchIcon class="search-icon" />
                                <input v-model="searchQuery" type="text" placeholder="Search announcements..." class="search-input" />
                            </div>
                        </div>
                    </div>

                    <!-- Right side: Actions -->
                    <div class="d-flex align-center gap-3">
                        <div class="selection-controls d-flex align-center" v-if="announcements.length > 0">
                            <v-btn
                                v-if="selectedAnnouncements.length > 0"
                                color="error"
                                variant="tonal"
                                size="small"
                                class="ms-2"
                                @click="deleteSelectedAnnouncements"
                                :loading="loading"
                            >
                                <TrashIcon class="me-1" size="16" />
                                Delete ({{ selectedAnnouncements.length }})
                            </v-btn>
                        </div>

                        <v-btn color="primary" variant="elevated" @click="openPopup" :loading="loading" class="add-btn">
                            <PlusIcon class="me-1" size="18" />
                            New Announcement
                        </v-btn>
                    </div>
                </div>
            </v-card-item>
        </v-card>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
            <p class="mt-4 text-body-1">Loading announcements...</p>
        </div>

        <!-- Empty state -->
        <v-card v-else-if="announcements.length === 0" elevation="1" class="empty-state text-center py-8">
            <v-card-item>
                <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-bell-off" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
                    <h3 class="text-h5 font-weight-medium mb-2">No Announcements Yet</h3>
                    <p class="text-body-1 text-grey mb-4">Create your first announcement to get started</p>
                    <v-btn color="primary" @click="openPopup">
                        <PlusIcon class="me-1" />
                        New Announcement
                    </v-btn>
                </div>
            </v-card-item>
        </v-card>

        <!-- Announcements list -->
        <div v-else class="announcements-list">
            <v-card
                v-for="announcement in filteredAnnouncements"
                :key="announcement.id"
                elevation="2"
                class="announcement-card mb-4"
                :class="{ selected: announcement.selected }"
            >
                <div class="d-flex">
                    <!-- Selection checkbox -->
                    <div class="selection-column pa-4 d-flex align-start">
                        <v-checkbox
                            v-model="announcement.selected"
                            @change="toggleSelection(announcement.id)"
                            density="compact"
                            hide-details
                            color="primary"
                        ></v-checkbox>
                    </div>

                    <!-- Avatar -->
                    <div class="avatar-column pa-4 d-flex justify-center">
                        <div :class="['avatar-circle', getAvatarColor(announcement.author_name)]">
                            {{ getInitials(announcement.author_name) }}
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="content-column pa-4">
                        <div class="d-flex justify-space-between align-center mb-2">
                            <h3 class="text-h6 font-weight-bold mb-0">{{ announcement.title }}</h3>

                            <div class="d-flex">
                                <v-btn
                                    icon
                                    variant="text"
                                    size="small"
                                    color="error"
                                    @click="showConfirmationDialog(announcement.id)"
                                    class="ms-2"
                                >
                                    <TrashIcon size="18" />
                                </v-btn>
                            </div>
                        </div>

                        <div class="d-flex align-center mb-3">
                            <UserIcon size="16" class="text-grey me-1" />
                            <span class="text-subtitle-2 font-weight-medium me-4">{{ announcement.author_name }}</span>

                            <!-- <CalendarIcon size="16" class="text-grey me-1" />
              <span class="text-caption text-grey">
                {{ formatDate(announcement.created_at) }} at {{ formatTime(announcement.created_at) }}
              </span> -->
                        </div>

                        <p class="announcement-content text-body-1">
                            {{ announcement.content }}
                        </p>
                    </div>
                </div>
            </v-card>
        </div>

        <!-- Add Announcement Dialog -->
        <v-col cols="12" sm="12" lg="4" class="d-flex align-center justify-center">
            <v-card elevation="0" v-if="showPopup" class="popup-card" style="z-index: 10">
                <div class="popup-contentp">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <v-card-title class="title" style="margin: 10px auto; text-align: center">
                            <h1>Add New Announcement</h1>
                        </v-card-title>
                        <v-btn icon color="inherit" @click="closePopup" flat style="transform: translateY(-30px)">
                            <XIcon stroke-width="1.5" size="24" class="text-grey100" />
                        </v-btn>
                    </div>
                    <form @submit.prevent="submitForm">
                        <div class="formContainer">
                            <fieldset class="field1">
                                <div class="inputGroup">
                                    <input
                                        type="text"
                                        id="numero_control"
                                        v-model="announcementForm.author_name"
                                        autocomplete="off"
                                    />
                                    <label for="numero_control">Author Name</label>
                                </div>
                            </fieldset>

                            <fieldset class="field2">
                                <div class="inputGroup">
                                    <input
                                        type="text"
                                        id="numero_control"
                                        v-model="announcementForm.title"
                                        autocomplete="off"
                                    />
                                    <label for="numero_control">Title</label>
                                </div>
                            </fieldset>

                            <fieldset class="field3">
                                <div class="inputGroup">
                                  
                                    <input
                                        type="text"
                                        id="numero_control"
                                        v-model="announcementForm.content"
                                        autocomplete="off"
                                        
                                    />
                                    <label for="numero_control">Content</label>
                                </div>
                            </fieldset>
                        </div>

                        <v-btn color="primary" type="submit" id="add">Publish Announcement</v-btn>
                        <v-btn id="add" class="cancel-btn" @click="resetForm">Cancel</v-btn>
                    </form>
                </div>
            </v-card>
        </v-col>
    </div>
</template>

<style scoped>
.announcements-container {
    max-width: 100%;
    margin: 0 auto;
}

.header-card {
    border-radius: 12px;
    background-color: white;
    transition: box-shadow 0.3s ease;
}

.search-container {
    position: relative;
    min-width: 250px;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #757575;
}

.search-input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background-color: #f5f5f5;
}

.search-input:focus {
    outline: none;
    border-color: var(--v-primary-base);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(var(--v-primary-base), 0.1);
}

.add-btn {
    border-radius: 8px;
    font-weight: 500;
}

.announcements-list {
    margin-top: 16px;
}

.announcement-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}

.announcement-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.announcement-card.selected {
    border-left-color: var(--v-primary-base);
    background-color: rgba(var(--v-primary-base), 0.05);
}

.selection-column {
    width: 50px;
}

.avatar-column {
    width: 80px;
}

.content-column {
    flex: 1;
}

.avatar-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.bg-primary {
    background-color: #1976d2;
}
.bg-secondary {
    background-color: #424242;
}
.bg-success {
    background-color: #4caf50;
}
.bg-info {
    background-color: #2196f3;
}
.bg-warning {
    background-color: #ffc107;
}
.bg-danger {
    background-color: #f44336;
}
.bg-purple {
    background-color: #9c27b0;
}
.bg-pink {
    background-color: #e91e63;
}

.announcement-content {
    white-space: pre-line;
    color: #424242;
    line-height: 1.6;
}

.border-bottom {
    border-bottom: 1px solid #e0e0e0;
}

.add-announcement-dialog {
    border-radius: 12px;
}

.empty-state {
    border-radius: 12px;
    background-color: #fafafa;
}

@media (max-width: 600px) {
    .avatar-column {
        width: 60px;
    }

    .selection-column {
        width: 40px;
    }
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
