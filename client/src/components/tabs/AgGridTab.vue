<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useCsvParser } from '../../composables/useCsvParser'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const { rowData, parseCsv } = useCsvParser()
const rawCsv = ref('')

const columnDefs = [
  { headerName: 'Task Name', field: 'task' },
  { headerName: 'Assignee', field: 'assignee' },
  { headerName: 'Status', field: 'status', filter: 'agSetColumnFilter' },
  { headerName: 'Due Date', field: 'dueDate' },
]

function handlePaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || ''
  rawCsv.value = pastedText
  parseCsv(pastedText)
}
</script>

<template>
  <div>
    <p><strong>Paste CSV (4 fields: task, assignee, status, due date):</strong></p>
    <textarea
      @paste="handlePaste"
      placeholder="Paste CSV or Excel rows here"
      rows="4"
      style="width: 100%; margin-bottom: 1rem"
    ></textarea>

    <div class="ag-theme-alpine" style="height: 650px; width: 100%">
      <AgGridVue
        class="ag-grid"
        :theme="'legacy'"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="{ sortable: true, filter: true, resizable: true }"
      />
    </div>
  </div>
</template>

<style scoped>
.ag-grid {
  width: 100%;
  height: 100%;
}
</style>
