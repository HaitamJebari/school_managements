<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const loading = ref(false);
const message = ref('');
const router = useRouter();

const handleRegister = async () => {
    message.value = '';
    loading.value = true;
    try {
        const response = await axios.post('http://localhost:5000/register', {
            username: username.value,
            password: password.value
        });
        // Success alert
        await Swal.fire({
            title: 'Registered Successfully!',
            customClass: {
                confirmButton: 'btn btn-success'
            },
            text: 'You can now sign in.',
            icon: 'success',
            confirmButtonText: 'Go to Login',
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        // Redirect to login
        router.push('login');
    } catch (error: any) {
        Swal.fire({
            title: 'Registration Failed',
            text: error.response?.data?.message || 'Please try again.',
            icon: 'error'
        });
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Username</v-label>
            <v-text-field v-model="username" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        <!-- <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Email Address</v-label>
            <v-text-field variant="outlined" type="email" hide-details color="primary"></v-text-field>
        </v-col> -->
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Password</v-label>
            <v-text-field v-model="password" variant="outlined" type="password" hide-details color="primary"></v-text-field>
        </v-col>
        <v-col cols="12">
            <v-btn :loading="loading" @click="handleRegister" color="primary" rounded="pill" size="large" block flat>Sign up</v-btn>
        </v-col>
    </v-row>
</template>
