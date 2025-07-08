<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useCsvParser } from '../composables/useCSVParser'
// @ts-ignore
import dummyText from "../assets/dummy2.txt?raw"

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { GridApi, GridOptions, ColDef, RowStyle } from 'ag-grid-community'

// max((available master + fab meter prod)* panels, fg req) - a grade comp 

ModuleRegistry.registerModules([AllCommunityModule])

const { rowData, parseCsv } = useCsvParser()
const rawCsv = ref('')
const showModal = ref(false)

const gridApi = ref<GridApi | null>(null)

const columnDefs: ColDef[] = [
  { headerName: 'MO Status', field: 'moStatus', /* enableRowGroup: true*/ },
  { headerName: 'SO Promise Date', field: 'soPromiseDate', valueFormatter: formatDateCell, filter: 'agDateColumnFilter', /* enableRowGroup: true*/ },
  { headerName: 'Fab to Inspect/Unassign', field: 'fabToInspectUnassign' },
  { headerName: 'FG Panel Items', field: 'fgPanelItems', width: 135 },
  { headerName: 'FG MO', field: 'fgMo' },
  { headerName: 'Fab Item', field: 'fabItem', /* enableRowGroup: true*/ },
  { headerName: 'Ship To Customer', field: 'shipToCustomerName' , /* enableRowGroup: true*/ },
  { headerName: 'Core Size', field: 'coreSize' },
  { headerName: 'A Grade Completed', field: 'aGradeCompleted' },
  { headerName: 'FG Req Qty', field: 'fgReqQty' },
  { headerName: 'Fab Metres Prod.', field: 'fabMetresProd' },
  { headerName: 'Available Master Qty', field: 'availableMasterQty' },
  { headerName: 'Fab MO', field: 'fabMo' },
  { headerName: 'Target Roll Len', field: 'targetRollLen' },
  { headerName: 'Hrs', field: 'hrs' },
  { headerName: 'Assigned Machine', field: 'assignedMachine', /* enableRowGroup: true*/ },
  { headerName: 'Fab Description', field: 'fabDescription' },
//   { headerName: 'Sold To', field: 'soldTo', enableRowGroup: true },
  { headerName: 'Prod Structure', field: 'prodStructure' },
  { headerName: '# Of Aframes', field: 'numOfAframes' },
  { headerName: 'Extrusion Completed', field: 'extrusionCompleted' },
  { headerName: 'Destination', field: 'dest' },
//   { headerName: 'Scheduled Machine', field: 'scheduledMachine' },
  { headerName: 'Activity', field: 'activity' },
  { headerName: 'Open Qty', field: 'openQty' },
  { headerName: 'MO Promise Date', field: 'moPromiseDate', valueFormatter: formatDateCell, filter: 'agDateColumnFilter', },
  { headerName: 'Ship To Customer', field: 'shipToCustomer' },
  { headerName: 'FG Item ID', field: 'fgItemID' },
]

const columnDefsWithTooltips = columnDefs.map(col => ({
  ...col,
  headerTooltip: col.headerName,
}))

parseCsv(dummyText)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function applyCsv() {
  parseCsv(rawCsv.value)
  resizeCells();
  rawCsv.value = '';
  showModal.value = false
}

function formatDateCell(params: any) {
  const raw = params.value;
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

  return `${day}/${month} - ${weekday}`;
}

function resizeCells() {
  gridApi.value?.autoSizeAllColumns(true)
  gridApi.value?.applyColumnState({
    state: [
      {
        colId: 'fgPanelItems',
        width: 140,
      },
      {
        colId: 'shipToCustomerName',
        width: 240
      }
    ],
    applyOrder: false,
  })
}

function onHamburgerClick() {
  console.log("Hamburger menu clicked");
  // You can open a sidebar, modal, or dropdown here
}


const gridOptions: GridOptions = {
  columnDefs: columnDefsWithTooltips,
  defaultColDef: {
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    sortable: true,
    resizable: true,
    minWidth: 80,
  },
//   groupDisplayType: 'groupRows',
  tooltipShowDelay: 0,
//   rowGroupPanelShow: "always",
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
    params.api.setFilterModel({
      moStatus: {
        type: 'notContains',
        filter: 'closed',
        filterType: 'text',
      },
    });
    params.api.applyColumnState({ state: [
      { colId: 'soPromiseDate', sort: 'asc', sortIndex: 0 },
      { colId: "fabToInspectUnassign", sort: "desc", sortIndex: 1 },
    ]});
  },
  onFirstDataRendered: resizeCells,
  getRowStyle: (params) => {
    const data = params.data;
    const fabToInspect = parseInt(data.fabToInspectUnassign.replace(/,/g, '')) || 0;
    const master = parseInt(data.availableMasterQty.replace(/,/g, '')) || 0;
    const aGradeComp = parseInt(data.aGradeCompleted.replace(/,/g, '')) || 0;
    const req = parseInt(data.fgReqQty.replace(/,/g, '')) || 0;

    if (req === 0) return {}; // avoid division by 0

    const ratio = ((fabToInspect + master) * 100) / (req - aGradeComp);
    if (ratio < 20 && req > aGradeComp) {
      return { backgroundColor: '#eee' }; // light gray
    }
    return {} as RowStyle;
  }
}
</script>


<template>
  <div class="ag-grid-tab">
    <div class="ag-grid-tab-header">
      <button @click="openModal">Add/Update Data</button>
      <button class="hamburger-menu" @click="onHamburgerClick">
        &#9776;
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Paste CSV or Excel rows</h3>
        <textarea
          v-model="rawCsv"
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