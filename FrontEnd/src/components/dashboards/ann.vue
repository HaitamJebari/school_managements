<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxIcon } from 'vue-tabler-icons';
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="12"  >
            <v-card elevation="10" style="border-radius: 20px;  display: flex; justify-content: center">
                <form class="form">
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
                <div style="display: flex; align-items: center; padding: 10px; gap: 4px">
                    <input type="checkbox" name="check" id="check">
                    <label name="check">Select All</label>
                </div>
            </v-card>
        </v-col>
  
        <v-col cols="12" sm="12" lg="12">

            <div class="list_msg">
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-2.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-3.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-4.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-5.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-6.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
                <div class="list">
                    <div class="img-box">
                        <img src="../../assets/images/profile/user-2.jpg" alt=""  srcset="" />
                    </div>
                    <v-card elevation="10" style="height: 150px; padding: 25px;">
    
                        <h3>Haitam Jebari</h3>
                        <h6>Lorem Ipsum </h6>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi sint eligendi autem atque dignissimos a, delectus
                            enim natus. Ullam quisquam quo 
                        </p>
                    </v-card>          
                </div>
            </div>
        </v-col>
    </v-row>
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
    color: gray;
}

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
    color: gray;
}
.list_msg {
    max-width: 100%;
    height: 700px;
    overflow: auto;
    padding: 50px;
    border-radius: 8px;
}
.list{
    display: flex;
    gap: 20px;
    margin-bottom: 25px;
}
.img-box{
   padding-top: 30px;
}
img{
    width: 70px;
    height:70px;
    border-radius: 50%;
}
</style>
