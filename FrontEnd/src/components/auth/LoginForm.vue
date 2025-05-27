<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const username = ref('');
const password = ref('');
const message = ref('');
const loading = ref(false);
const router = useRouter(); 

const handleLogin = async () => {
    message.value = '';
    loading.value = true;
    try {
        const res = await axios.post('http://localhost:5000/login', {
            username: username.value,
            password: password.value
        }); 

        console.log('Login response:', res.data); // Check what's returned

        await Swal.fire({
            title: 'Login Successful',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000 
        });
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/'); 
    } catch (error: any) {
        console.error('Login error:', error); // Log full error

        Swal.fire({
            title: 'Login Failed',
            text: 'Invalid username or password',
            icon: 'error',
            confirmButtonColor: 'red',
            didOpen: () => {
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.style.color = 'white'; 
            }
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <v-row class="mb-3">
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Username</v-label>
                <v-text-field v-model="username" variant="outlined" class="pwdInput" hide-details color="primary"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Password</v-label>
                <v-text-field
                    v-model="password"
                    variant="outlined"
                    class="border-borderColor"
                    type="password"
                    hide-details
                    color="primary"
                ></v-text-field>
            </v-col>
            <!-- <v-col cols="12 " class="py-0">
                <div class="d-flex flex-wrap align-center w-100">
                    <div class="ml-sm-auto">
                        <RouterLink to="" class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium">
                            Forgot Password ?</RouterLink
                        >
                    </div>
                </div>
            </v-col> -->
            <v-col cols="12">
                <v-btn
                    :loading="loading"
                    size="large"
                    rounded="pill"
                    color="primary"
                    @click="handleLogin"
                    class="rounded-pill"
                    block
                    type="submit"
                    flat
                    >Sign In</v-btn
                >
            </v-col>
        </v-row>
    </div>
</template>
