<script setup lang="ts">
import { ref } from "vue";

const showModal = ref(false);


function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
</script>

<template>
  <div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Paste CSV or Excel rows</h3>
         <!-- v-model="rawCsv" -->
        <textarea placeholder="Paste CSV or Excel rows here"></textarea>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
    <div class="toolbar-header">
      <button class="textile btn" @click="$router.push('/inspection')">
        <img src="../assets/inspection_icon.webp" alt="Fabric Roll" width="45" height="45" />
        <div>Inspect</div>
      </button>
      <div class="toolbar">
        <button class="btn" @click="openModal">✚ Greige Data</button>
        <button class="btn" @click="openModal">✚ Tenter Data</button>
      </div>
    </div>
    Welcome to the Textile Page
  </div>
</template>
