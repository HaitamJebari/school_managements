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
    .filter(announcement => {
      if (searchQuery.value === '') return true;
      return announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             announcement.author_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             announcement.content.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
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
      },
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
          selectedAnnouncements.value = selectedAnnouncements.value.filter(id => id !== announcementId);
          isSelectedAll.value = selectedAnnouncements.value.length === announcements.value.length && announcements.value.length > 0;
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
  const colors = [
    'bg-primary', 'bg-secondary', 'bg-success', 'bg-info', 
    'bg-warning', 'bg-danger', 'bg-purple', 'bg-pink'
  ];
  
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
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Search announcements..." 
                  class="search-input"
                />
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
            
            <v-btn
              color="primary"
              variant="elevated"
              @click="openPopup"
              :loading="loading"
              class="add-btn"
            >
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
        :class="{ 'selected': announcement.selected }"
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
    <v-dialog v-model="showPopup" max-width="600px" persistent>
      <v-card class="add-announcement-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4 border-bottom">
          <h2 class="text-h5 font-weight-bold">New Announcement</h2>
          <v-btn icon variant="text" @click="closePopup">
            <XIcon />
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <form @submit.prevent="submitForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="announcementForm.author_name"
                  label="Author Name"
                  variant="outlined"
                  required
                  :disabled="loading"
                  placeholder="Enter your name"
                  prepend-inner-icon="mdi-account"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="announcementForm.title"
                  label="Announcement Title"
                  variant="outlined"
                  required
                  :disabled="loading"
                  placeholder="Enter a descriptive title"
                  prepend-inner-icon="mdi-format-title"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="announcementForm.content"
                  label="Announcement Content"
                  variant="outlined"
                  required
                  :disabled="loading"
                  placeholder="Enter the announcement details"
                  rows="5"
                  prepend-inner-icon="mdi-text"
                ></v-textarea>
              </v-col>
            </v-row>
          </form>
        </v-card-text>
        
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            color="grey" 
            @click="closePopup"
            :disabled="loading"
          >
            Cancel
          </v-btn>
          <v-btn 
            variant="elevated" 
            color="primary" 
            @click="submitForm"
            :loading="loading"
            class="ms-2"
          >
            Publish Announcement
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

.bg-primary { background-color: #1976D2; }
.bg-secondary { background-color: #424242; }
.bg-success { background-color: #4CAF50; }
.bg-info { background-color: #2196F3; }
.bg-warning { background-color: #FFC107; }
.bg-danger { background-color: #F44336; }
.bg-purple { background-color: #9C27B0; }
.bg-pink { background-color: #E91E63; }

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
</style>
