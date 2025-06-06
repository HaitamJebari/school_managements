<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import sidebarItems from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
// Icon Imports
import { Menu2Icon, BellRingingIcon } from 'vue-tabler-icons';
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import { router } from '@/router';
const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);

const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/auth/login');
};
</script>

<template>
    <v-navigation-drawer left v-model="sDrawer" app class="leftSidebar ml-sm-7 mt-sm-4 bg-containerBg" elevation="10" width="270">
        <div class="pa-5 pl-4">
            <Logo />
        </div>
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar bg-containerBg overflow-y-hidden">
            <v-list class="py-2 px-4 bg-containerBg">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu">
                    <!---Item Sub Header -->
                    <NavGroup :item="item" v-if="item.header" :key="item.title" />
                    <!---Single Item-->
                    <NavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
                <div class="logout-container pa-7">
                    <button class="Btn" @click="handleLogout">
                        <div class="sign">
                            <svg viewBox="0 0 512 512">
                                <path
                                    d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                                ></path>
                            </svg>
                        </div>

                        <div class="text" >Logout</div>
                    </button>
                </div>
            </v-list>
        </perfect-scrollbar>
    </v-navigation-drawer>
    <div class="container verticalLayout">
        <div class="maxWidth">
            <v-app-bar elevation="0" height="70">
                <div class="d-flex align-center justify-space-between w-100">
                    <form class="form" >
                        <button>
                            <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                                <path
                                    d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                                    stroke="currentColor"
                                    stroke-width="1.333"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>
                            </svg>
                        </button>

                        <input class="input" placeholder="Type your text" v-model="searchQuery" required="" type="text" />

                        <button class="reset" type="reset">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </form>
                    <ProfileDD />
                </div>
            </v-app-bar>
        </div>
    </div>
</template>
<style scoped>
/* removing default style of button */

.form button {
    border: none;
    background: none;
    color: #8b8ba7;
}
/* styling of whole input container */
.form {
    --timing: 0.3s;
    --width-of-input: 80%;
    --height-of-input: 40px;
    --border-height: 2px;
    --input-bg: #fff;
    --border-color: #41414e7d;
    --border-radius: 30px;
    --after-border-radius: 1px;
    position: relative;
    width: var(--width-of-input);
    height: var(--height-of-input);
    display: flex;
    align-items: center;
    padding-inline: 0.8em;
    border-radius: var(--border-radius);
    transition: border-radius 0.5s ease;
    background: var(--input-bg, #fff);
}
/* styling of Input */
.input {
    font-size: 0.9rem;
    background-color: transparent;
    width: 100%;
    height: 100%;
    padding-inline: 0.5em;
    padding-block: 0.7em;
    border: none;
}
/* styling of animated border */
.form:before {
    content: '';
    position: absolute;
    background: var(--border-color);
    transform: scaleX(0);
    transform-origin: center;
    width: 100%;
    height: var(--border-height);
    left: 0;
    bottom: 0;
    border-radius: 1px;
    transition: transform var(--timing) ease;
}
/* Hover on Input */
.form:focus-within {
    border-radius: var(--after-border-radius);
}

input:focus {
    outline: none;
}
/* here is code of animated border */
.form:focus-within:before {
    transform: scale(1);
}
/* styling of close button */
/* == you can click the close button to remove text == */
.reset {
    border: none;
    background: none;
    opacity: 0;
    visibility: hidden;
}
/* close button shown when typing */
input:not(:placeholder-shown) ~ .reset {
    opacity: 1;
    visibility: visible;
}
/* sizing svg icons */
.form svg {
    width: 25px;
}

.Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    justify-self: center;
    margin-top: 30px;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: white;
}

/* plus sign */
.sign {
    width: 100%;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sign svg {
    width: 17px;
}

.sign svg path {
    fill: rgba(33, 150, 243, 1);
}
/* text */
.text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 600;
    transition-duration: 0.3s;
}
/* hover effect on button width */
.Btn:hover {
    background-color: rgba(33, 150, 243, 1);
    width: 125px;
    border-radius: 40px;
    transition-duration: 0.3s;
}

.Btn:hover .sign {
    width: 30%;
    transition-duration: 0.3s;
    padding-left: 20px;
}

.Btn:hover .sign svg path {
    fill: white;
}

/* hover effect button's text */
.Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: 0.3s;
    padding-right: 10px;
}
/* button click effect*/
.Btn:active {
    transform: translate(2px, 2px);
}
.logout-container{
      margin-top:5em;
}

</style>
