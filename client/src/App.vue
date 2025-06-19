<script setup lang="ts">
import { ref } from 'vue'
import AgGridTab from './components/tabs/AgGridTab.vue'
import OtherTab from './components/tabs/OtherTab.vue'
import './style.css'

const activeTab = ref<'grid' | 'other'>('grid')
</script>

<template>
  <div>
    <nav>
      <button @click="activeTab = 'grid'">AG Grid View</button>
      <button @click="activeTab = 'other'">Other Tab</button>
    </nav>
    <component :is="activeTab === 'grid' ? AgGridTab : OtherTab" />
  </div>
</template>
