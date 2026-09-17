<script setup lang="ts">

import { ref } from 'vue';

const COLUMN_LENGTH = 12;
;

const digits = ref<number[]>([]);

function randomDigit() {
    return Math.floor(Math.random() * 9) + 1;
}

function generateColumn() {
    digits.value = Array.from({ length: 12 }, randomDigit);
}

generateColumn();

</script>



<template>
    <main class="page">
        <header class="header">
            <h1>Learning Path Vue with React basic</h1>
        </header>
    </main>

    <section class="workspace">
        <div class="column-card">
            <ol class="column" aria-label="Kolom Angka">
                <template></template>
            </ol>
        </div>
    </section>
</template>



<style scoped>

</style>