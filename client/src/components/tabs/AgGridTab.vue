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
  { headerName: 'Quality Status', field: 'qualityStatus' },
  { headerName: 'Status', field: 'status' },
  { headerName: 'MO Status', field: 'moStatus' },
  { headerName: 'Rolls to Pack', field: 'rollsToPack' },
  { headerName: 'Rolls To Transfer', field: 'rollsToTransfer' },
  { headerName: 'Skids Left to Transfer', field: 'skidsLeftToTransfer' },
  { headerName: 'Fab to Inspect/Unassign', field: 'fabToInspectUnassign' },
  { headerName: 'MO Promise Date', field: 'moPromiseDate' },
  { headerName: 'SO Promise Date', field: 'soPromiseDate' },
  { headerName: 'FG Panel Items', field: 'fgPanelItems' },
  { headerName: 'FG MO', field: 'fgMo' },
  { headerName: 'Ship To Customer', field: 'shipToCustomer' },
  { headerName: 'Core Size', field: 'coreSize' },
  { headerName: 'A Grade Completed', field: 'aGradeCompleted' },
  { headerName: 'FG Req Qty', field: 'fgReqQty' },
  { headerName: 'Open Qty', field: 'openQty' },
  { headerName: 'Extrusion Completed', field: 'extrusionCompleted' },
  { headerName: 'Fab Metres Prod.', field: 'fabMetresProd' },
  { headerName: '# Of Aframes', field: 'numOfAframes' },
  { headerName: 'Fab MO', field: 'fabMo' },
  { headerName: 'Available Master Qty', field: 'availableMasterQty' },
  { headerName: 'Fab Item', field: 'fabItem' },
  { headerName: 'Fab Description', field: 'fabDescription' },
  { headerName: 'Sold To', field: 'soldTo' },
  { headerName: 'Prod Structure', field: 'prodStructure' },
  { headerName: 'Pri', field: 'pri' },
  { headerName: 'Type', field: 'type' },
  { headerName: 'Dest', field: 'dest' },
  { headerName: 'Target Roll Len', field: 'targetRollLen' },
  { headerName: 'Bags Required', field: 'bagsRequired' },
  { headerName: 'Assigned Machine', field: 'assignedMachine' },
  { headerName: 'Scheduled Machine', field: 'scheduledMachine' },
  { headerName: 'Activity', field: 'activity' },
  { headerName: 'Hrs', field: 'hrs' },
  { headerName: 'Days', field: 'days' },
  { headerName: 'Schedule Complete Date', field: 'scheduleCompleteDate' },
];

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
