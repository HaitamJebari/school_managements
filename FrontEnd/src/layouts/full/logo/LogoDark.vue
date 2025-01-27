<script setup lang="ts">
import { RouterLink } from 'vue-router';
import logo from '@/assets/images/logos/logo-dark.svg';
import logod from '@/assets/images/logos/logo.png';

</script>
<template>
    <div class="logo">
        <RouterLink to="/">
            <!-- <img :src="logo" alt="home" /> -->
            <img :src="logod" alt="home" />
        </RouterLink>
    </div>
</template>
<style scoped>
img{
    width: 40%;
    height: 40%;
    position: center;
    transform: translateX(70%);
}
</style>
