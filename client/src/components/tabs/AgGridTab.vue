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
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise'

// max((available master + fab meter prod)* panels, fg req) - a grade comp 

ModuleRegistry.registerModules([AllCommunityModule])
ModuleRegistry.registerModules([RowGroupingModule, RowGroupingPanelModule])

const { rowData, parseCsv } = useCsvParser()
const rawCsv = ref('')
const showModal = ref(false)
const tempCsv = ref('')

const gridApi = ref<GridApi | null>(null)

const columnDefs: ColDef[] = [
  { headerName: 'MO Status', field: 'moStatus', filter: 'agTextColumnFilter', enableRowGroup: true },
  { headerName: 'Fab to Inspect/Unassign', field: 'fabToInspectUnassign' },
  { headerName: 'MO Promise Date', field: 'moPromiseDate', filter: 'agDateColumnFilter' },
  { headerName: 'SO Promise Date', field: 'soPromiseDate', filter: 'agDateColumnFilter', enableRowGroup: true },
  { headerName: 'FG Panel Items', field: 'fgPanelItems', filter: 'agTextColumnFilter' },
  { headerName: 'FG Item ID', field: 'fgItemID', filter: 'agTextColumnFilter' },
  { headerName: 'FG MO', field: 'fgMo', filter: 'agNumberColumnFilter' },
  { headerName: 'Ship To Customer', field: 'shipToCustomer' },
  { headerName: 'Ship To Customer', field: 'shipToCustomerName', enableRowGroup: true },
  { headerName: 'Core Size', field: 'coreSize' },
  { headerName: 'A Grade Completed', field: 'aGradeCompleted' },
  { headerName: 'FG Req Qty', field: 'fgReqQty' },
  { headerName: 'Open Qty', field: 'openQty' },
  { headerName: 'Extrusion Completed', field: 'extrusionCompleted' },
  { headerName: 'Fab Metres Prod.', field: 'fabMetresProd' },
  { headerName: '# Of Aframes', field: 'numOfAframes' },
  { headerName: 'Fab MO', field: 'fabMo' },
  { headerName: 'Available Master Qty', field: 'availableMasterQty' },
  { headerName: 'Fab Item', field: 'fabItem', enableRowGroup: true },
  { headerName: 'Fab Description', field: 'fabDescription' },
  { headerName: 'Sold To', field: 'soldTo', maxWidth: 220, enableRowGroup: true },
  { headerName: 'Prod Structure', field: 'prodStructure' },
  { headerName: 'Destination', field: 'dest' },
  { headerName: 'Target Roll Len', field: 'targetRollLen' },
  { headerName: 'Assigned Machine', field: 'assignedMachine', enableRowGroup: true },
  { headerName: 'Scheduled Machine', field: 'scheduledMachine' },
  { headerName: 'Activity', field: 'activity' },
  { headerName: 'Hrs', field: 'hrs' },
]

const columnDefsWithTooltips = columnDefs.map(col => ({
  ...col,
  headerTooltip: col.headerName,
}))

parseCsv(dummyText)
// rawCsv.value = dummyText

function openModal() {
  tempCsv.value = rawCsv.value
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function applyCsv() {
  rawCsv.value = tempCsv.value
  parseCsv(rawCsv.value)
  gridApi.value?.autoSizeAllColumns(true)
  showModal.value = false
}

const gridOptions: GridOptions = {
  columnDefs: columnDefsWithTooltips,
  defaultColDef: {
    floatingFilter: true,
    sortable: true,
    resizable: true,
    minWidth: 80,
    maxWidth: 320,
  },
  groupDisplayType: 'groupRows',
  tooltipShowDelay: 0,
  rowGroupPanelShow: "always",
  multiSortKey:'ctrl',
  rowSelection: {
    mode: 'multiRow',
    checkboxes: false,
    headerCheckbox: false,
    enableSelectionWithoutKeys: true,
    enableClickSelection: true
  },
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
    <button @click="openModal">Add/Update Data</button>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Paste CSV or Excel rows</h3>
        <textarea
          v-model="tempCsv"
          placeholder="Paste CSV or Excel rows here"
          rows="10"
          style="width: 100%;"
        ></textarea>
        <div class="modal-actions">
          <button @click="applyCsv">Apply</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #242424;
  padding: 2rem;
  padding-bottom: 2rem;
  border-radius: 6px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal h3 {
    margin-top: 0;
}
.modal button {
    margin-left: 10px;
}
/* .modal textarea {
    height: 400px;
} */

.modal-actions {
  margin-top: 1rem;
  text-align: right;
}

</style>