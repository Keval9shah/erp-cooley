<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { useCsvParser } from "../composables/useCSVParser";
// @ts-ignore
import dummyText from "../assets/dummy2.txt?raw";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { GridApi, GridOptions, ColDef, RowStyle } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const { rowData, parseCsv } = useCsvParser();
const rawCsv = ref("");
const showModal = ref(false);

const gridApi = ref<GridApi | null>(null);

const columnDefs: ColDef[] = [
  { headerName: "MO Status", field: "moStatus" /* enableRowGroup: true*/ },
  { headerName: "SO Promise Date", field: "soPromiseDate", valueFormatter: formatDateCell, filter: "agDateColumnFilter" /* enableRowGroup: true*/ },
  { headerName: "Fab to Inspect/Unassign", field: "fabToInspectUnassign" },
  { headerName: "FG Panel Items", field: "fgPanelItems", width: 135 },
  { headerName: "FG MO", field: "fgMo" },
  { headerName: "Fab Item", field: "fabItem" /* enableRowGroup: true*/ },
  { headerName: "Ship To Customer", field: "shipToCustomerName" /* enableRowGroup: true*/ },
  { headerName: "Core Size", field: "coreSize" },
  { headerName: "A Grade Completed", field: "aGradeCompleted" },
  { headerName: "FG Req Qty", field: "fgReqQty" },
  { headerName: "Fab Metres Prod.", field: "fabMetresProd" },
  { headerName: "Available Master Qty", field: "availableMasterQty" },
  { headerName: "Fab MO", field: "fabMo" },
  { headerName: "Target Roll Len", field: "targetRollLen" },
  { headerName: "Hrs", field: "hrs" },
  { headerName: "Assigned Machine", field: "assignedMachine" /* enableRowGroup: true*/ },
  { headerName: "Fab Description", field: "fabDescription" },
  //   { headerName: 'Sold To', field: 'soldTo', enableRowGroup: true },
  { headerName: "Prod Structure", field: "prodStructure" },
  { headerName: "# Of Aframes", field: "numOfAframes" },
  { headerName: "Extrusion Completed", field: "extrusionCompleted" },
  { headerName: "Destination", field: "dest" },
  //   { headerName: 'Scheduled Machine', field: 'scheduledMachine' },
  { headerName: "Activity", field: "activity" },
  { headerName: "Open Qty", field: "openQty" },
  { headerName: "MO Promise Date", field: "moPromiseDate", valueFormatter: formatDateCell, filter: "agDateColumnFilter" },
  { headerName: "Ship To Customer", field: "shipToCustomer" },
  { headerName: "FG Item ID", field: "fgItemID" },
];

const columnDefsWithTooltips = columnDefs.map((col) => ({
  ...col,
  headerTooltip: col.headerName,
}));

parseCsv(dummyText);

function openModal() { showModal.value = true; }
function closeModal() { showModal.value = false; }
function applyCsv() {
  parseCsv(rawCsv.value);
  resizeCells();
  rawCsv.value = "";
  showModal.value = false;
}

const currentFilterState = ref<string>("all");
const showDropdown = ref(false);

const filterButtonText = computed(() => {
  switch (currentFilterState.value) {
    case "all":
      return "All Jobs";
    case "slitter":
      return "Slitter Jobs";
    case "inspection":
      return "Inspection Jobs";
    case "mill":
      return "Kickouts";
    default:
      return "Filter Jobs";
  }
});

//Data
let currentIndex = 0;
const noOfToggles = 3;
let filterStates: string[] = ["all", "inspection", "slitter", "mill"];
const filterModels: Record<string, Partial<any>> = {
  slitter: {
    assignedMachine: { type: "contains", filter: "SLITTER", filterType: "text" },
    shipToCustomer: undefined,
  },
  inspection: {
    assignedMachine: { type: "contains", filter: "INSP", filterType: "text" },
    shipToCustomer: { type: "notContains", filter: "MILL", filterType: "text" },
  },
  mill: {
    assignedMachine: undefined,
    shipToCustomer: { type: "contains", filter: "MILL", filterType: "text" },
  },
  all: {
    assignedMachine: undefined,
    shipToCustomer: undefined,
  },
};

function applyGridFilter() {
  const currentModel = gridApi.value?.getFilterModel() ?? {};
  const update = filterModels[currentFilterState.value];

  Object.entries(update).forEach(([key, value]) => {
    if (value !== undefined) {
      currentModel[key] = value;
    } else {
      delete currentModel[key];
    }
  });

  gridApi.value?.setFilterModel(currentModel);
  resizeCells();
}

function cycleFilterOptions() {
  currentIndex = (currentIndex + 1) % noOfToggles;
  currentFilterState.value = filterStates[currentIndex];
  applyGridFilter();
  showDropdown.value = false;
}

function selectFilterOption(option: string) {
  currentFilterState.value = option;
  applyGridFilter();
  showDropdown.value = false;
}

const toggleDropdown = () => { showDropdown.value = !showDropdown.value }

onMounted(() => document.addEventListener("click", closeDropdown));
onUnmounted(() => document.removeEventListener("click", closeDropdown));

function closeDropdown(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const btn = document.getElementById("contextual-filter-button");
  const menu = document.getElementById("filter-dropdown-menu");
  if (btn && !btn.contains(target) && menu && !menu.contains(target)) {
    showDropdown.value = false;
  }
}

function formatDateCell(params: any) {
  const raw = params.value;
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);

  return `${day}/${month} - ${weekday}`;
}

function resizeCells() {
  gridApi.value?.autoSizeAllColumns(true);
  gridApi.value?.applyColumnState({
    state: [
      { colId: "fgPanelItems", width: 140 },
      { colId: "shipToCustomerName", width: 200 },
    ],
    applyOrder: false,
  });
}

function onHamburgerClick() {}

// Function to extract number of panels
function getNumberOfPanels(fgPanelItems: string): number {
  if (!fgPanelItems) return 1;
  const match = fgPanelItems.match(/(\d+)x/);
  if (match && match[1]) { return parseInt(match[1], 10); }
  return 1;
}

const gridOptions: GridOptions = {
  columnDefs: columnDefsWithTooltips,
  defaultColDef: {
    filter: "agTextColumnFilter",
    floatingFilter: true,
    sortable: true,
    resizable: true,
    minWidth: 80,
  },
  rowHeight: 35,
  tooltipShowDelay: 0,
  multiSortKey: "ctrl",
  rowSelection: {
    mode: "multiRow",
    checkboxes: false,
    headerCheckbox: false,
    enableSelectionWithoutKeys: true,
    enableClickSelection: true,
  },
  suppressColumnVirtualisation: true,
  onGridReady: (params: any) => {
    gridApi.value = params.api;
    params.api.setFilterModel({
      moStatus: {
        type: "notContains",
        filter: "closed",
        filterType: "text",
      },
    });
    params.api.applyColumnState({
      state: [
        { colId: "soPromiseDate", sort: "asc", sortIndex: 0 },
        { colId: "fabToInspectUnassign", sort: "desc", sortIndex: 1 },
      ],
    });
  },
  onFirstDataRendered: resizeCells,
  getRowStyle: (params) => {
    const data = params.data;
    const fabToInspect = parseInt(data.fabToInspectUnassign.replace(/,/g, "")) || 0;
    const master = parseInt(data.availableMasterQty.replace(/,/g, "")) || 0;
    const aGradeComp = parseInt(data.aGradeCompleted.replace(/,/g, "")) || 0;
    const req = parseInt(data.fgReqQty.replace(/,/g, "")) || 0;

    const noOfPanels = getNumberOfPanels(data.fgPanelItems);
    if (req === 0) return {};

    const calculatedValueForRatio = (fabToInspect + master) * noOfPanels;
    const ratio = (calculatedValueForRatio * 100) / (req - aGradeComp);

    if (ratio < 20 && req > aGradeComp) {
      return { backgroundColor: "#eee" };
    }
    return {} as RowStyle;
  },
};
</script>

<template>
  <div class="ag-grid-tab">
    <div class="ag-grid-tab-header">
      <button @click="openModal">Add/Update Data</button>
      <div class="contextual-filter-container">
        <div class="filter-button-group">
          <button class="filter-main-btn" @click="cycleFilterOptions">
            {{ filterButtonText }}
          </button>
          <button class="filter-arrow-btn" @click.stop="toggleDropdown">▼</button>
        </div>

        <div v-if="showDropdown" id="filter-dropdown-menu" class="filter-dropdown-menu">
          <button @click="selectFilterOption('all')" :class="{ active: currentFilterState === 'all' }">All Jobs</button>
          <button @click="selectFilterOption('inspection')" :class="{ active: currentFilterState === 'inspection' }">Inspection</button>
          <button @click="selectFilterOption('slitter')" :class="{ active: currentFilterState === 'slitter' }">Slitter</button>
          <button @click="selectFilterOption('mill')" :class="{ active: currentFilterState === 'mill' }">Kickouts</button>
        </div>
      </div>
      <button class="hamburger-menu" @click="onHamburgerClick">&#9776;</button>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Paste CSV or Excel rows</h3>
        <textarea v-model="rawCsv" placeholder="Paste CSV or Excel rows here" rows="10" style="width: 100%"></textarea>
        <div class="modal-actions">
          <button @click="applyCsv">Apply</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

    <div class="ag-theme-alpine">
      <AgGridVue class="ag-grid" :theme="'legacy'" :rowData="rowData" :grid-options="gridOptions" />
    </div>
  </div>
</template>
