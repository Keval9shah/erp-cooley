<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useCsvParser } from '../../composables/useCSVParser'
// @ts-ignore
import dummyText from "../../assets/dummy.txt?raw"

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { GridApi, GridOptions, ColDef, FirstDataRenderedEvent } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

const { rowData, parseCsv } = useCsvParser()
const rawCsv = ref('')
const gridApi = ref<GridApi | null>(null)

const columnDefs: ColDef[] = [
  { headerName: 'MO Status', field: 'moStatus', filter: 'agTextColumnFilter' },
  { headerName: 'Rolls to Pack', field: 'rollsToPack', filter: 'agNumberColumnFilter' },
  { headerName: 'Rolls To Transfer', field: 'rollsToTransfer', filter: 'agNumberColumnFilter' },
  { headerName: 'Skids Left to Transfer', field: 'skidsLeftToTransfer', filter: 'agNumberColumnFilter' },
  { headerName: 'Fab to Inspect/Unassign', field: 'fabToInspectUnassign' },
  { headerName: 'MO Promise Date', field: 'moPromiseDate', filter: 'agDateColumnFilter' },
  { headerName: 'SO Promise Date', field: 'soPromiseDate', filter: 'agDateColumnFilter' },
  { headerName: 'FG Panel Items', field: 'fgPanelItems', filter: 'agTextColumnFilter' },
  { headerName: 'FG Item ID', field: 'fgItemID', filter: 'agTextColumnFilter' },
  { headerName: 'FG MO', field: 'fgMo', filter: 'agNumberColumnFilter' },
  { headerName: 'Ship To Customer', field: 'shipToCustomer' },
  { headerName: 'Ship To Customer', field: 'shipToCustomerName' },
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
  { headerName: 'Destination', field: 'dest' },
  { headerName: 'Target Roll Len', field: 'targetRollLen' },
  { headerName: 'Bags Required', field: 'bagsRequired' },
  { headerName: 'Assigned Machine', field: 'assignedMachine' },
  { headerName: 'Scheduled Machine', field: 'scheduledMachine' },
  { headerName: 'Activity', field: 'activity' },
  { headerName: 'Hrs', field: 'hrs' },
  { headerName: 'Days', field: 'days' },
  { headerName: 'Schedule Complete Date', field: 'scheduleCompleteDate' },
]

const columnDefsWithTooltips = columnDefs.map(col => ({
  ...col,
  headerTooltip: col.headerName,
}))

parseCsv(dummyText)
rawCsv.value = dummyText

function handlePaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || ''
  rawCsv.value = pastedText
  parseCsv(pastedText)
  setTimeout(() => {
    gridApi.value?.autoSizeAllColumns(true)
  }, 100)
}

const gridOptions: GridOptions = {
  columnDefs: columnDefsWithTooltips,
  defaultColDef: {
    floatingFilter: true,
    sortable: true,
    resizable: true,
    minWidth: 80,
    maxWidth: 220,
  },
  tooltipShowDelay: 0,
  rowSelection: 'multiple',
  suppressColumnVirtualisation: true,
  onGridReady: (params: any) => {
    gridApi.value = params.api
  },
  onFirstDataRendered: (params: FirstDataRenderedEvent) => {
    params.api.autoSizeAllColumns(true)
  },
}
</script>

<template>
  <div class="ag-grid-tab">
    <textarea
      v-model="rawCsv"
      @paste="handlePaste"
      placeholder="Paste CSV or Excel rows here"
      rows="4"
      style="width: 100%; margin: 1rem 0"
    ></textarea>

    <button>Add/Update Data</button>

    <div class="ag-theme-alpine">
      <AgGridVue
        class="ag-grid"
        :theme="'legacy'"
        :rowData="rowData"
        :grid-options="gridOptions"
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