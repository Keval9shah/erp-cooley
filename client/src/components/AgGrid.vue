<script setup lang="ts">
import { useGridFilters } from "../composables/useGridFilters";
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { useCsvParser } from "../composables/useCSVParser";
// @ts-ignore
import dummyText from "../assets/dummy2.txt?raw";

import { themeAlpine, ModuleRegistry, AllCommunityModule, colorSchemeDarkBlue } from "ag-grid-community";
import type { GridApi, GridOptions, ColDef, RowStyle, RowDropZoneParams } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const { rowData, parseCsv } = useCsvParser();
const rawCsv = ref("");
const showModal = ref(false);

const gridApi = ref<GridApi | null>(null);

const columnDefs: ColDef[] = [
  { headerName: "MO Status", field: "moStatus" },
  { headerName: "SO Promise Date", field: "soPromiseDate", valueFormatter: formatDateCell, filter: "agDateColumnFilter" },
  { headerName: "Fab to Inspect/Unassign", field: "fabToInspectUnassign", valueGetter: (params) => parseFloat((params.data.fabToInspectUnassign || "0").replace(/,/g, "")), valueFormatter: (params) => (params.value != null ? params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "") },
  { headerName: "FG Panel Items", field: "fgPanelItems", width: 135 },
  { headerName: "FG MO", field: "fgMo" },
  { headerName: "Fab Item", field: "fabItem" },
  { headerName: "Ship To Customer", field: "shipToCustomerName" },
  { headerName: "Core Size", field: "coreSize" },
  { headerName: "A Grade Completed", field: "aGradeCompleted" },
  { headerName: "FG Req Qty", field: "fgReqQty" },
  { headerName: "Fab Metres Prod.", field: "fabMetresProd" },
  { headerName: "Available Master Qty", field: "availableMasterQty" },
  { headerName: "Fab MO", field: "fabMo" },
  { headerName: "Target Roll Len", field: "targetRollLen" },
  { headerName: "Hrs", field: "hrs" },
  { headerName: "Assigned Machine", field: "assignedMachine" },
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

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
function applyCsv() {
  parseCsv(rawCsv.value);
  resizeCells();
  rawCsv.value = "";
  showModal.value = false;
}

onMounted(() => {
  document.addEventListener("click", closeDropdown);
  
const machineCards = document.querySelectorAll('.machine-card');

machineCards.forEach(machineCard => {
  const machineName = machineCard.querySelector('.machine-name') as HTMLElement;
  const originalTop = machineName.offsetTop;
  machineCard.addEventListener('scroll', () => {
    if (machineCard.scrollTop > originalTop) {
      machineName.classList.add('scrolled');
    } else {
      machineName.classList.remove('scrolled');
    }
  });
});
});
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

const registeredDropZones: Record<string, RowDropZoneParams> = {};

function registerDropZones() {
  const containers: NodeListOf<HTMLElement> = document.querySelectorAll(".machine-card");

  containers.forEach((container) => {
    const id = container.id;

    // If already registered, remove the existing drop zone
    if (registeredDropZones[id]) {
      gridApi.value?.removeRowDropZone(registeredDropZones[id]);
    }

    const dropZoneParams = {
      getContainer: () => container,
      onDragStop: (dragParams: any) => {
        const { fgMo, fgItemID, soPromiseDate } = dragParams.node.data;
        machineQueues[container.id].push({ fgMo, fgItemID, soPromiseDate });
      },
    };

    gridApi.value?.addRowDropZone(dropZoneParams);
    registeredDropZones[id] = dropZoneParams;
  });
}

// Function to extract number of panels
function getNumberOfPanels(fgPanelItems: string): number {
  if (!fgPanelItems) return 1;
  const match = fgPanelItems.match(/(\d+)x/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
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
  tooltipShowDelay: 0,
  multiSortKey: "ctrl",
  rowSelection: {
    mode: "multiRow",
    checkboxes: false,
    headerCheckbox: false,
    enableSelectionWithoutKeys: true,
    enableClickSelection: true,
  },
  // rowDragManaged: true,
  rowHeight: 40,
  rowDragEntireRow: true,
  rowDragText: (params) => `${params.rowNode?.data.fgMo} - ${params.rowNode?.data.fgItemID}`,
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

    registerDropZones();
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
      return { backgroundColor: "#1a1a1a" };
    }
    return {} as RowStyle;
  },
};

const {
  currentFilterState,
  currentDateFilterState,
  showDropdown,
  showDateDropdown,
  jobTypeFilterButtonText,
  dateFilterButtonText,
  machinesToShow,
  selectFilterOption,
  selectDateFilterOption,
  cycleJobTypeFilterOptions,
  cycleDateFilterOptions
} = useGridFilters(gridApi, resizeCells, registerDropZones);

const machineQueues = reactive<Record<string, any[]>>({
  "#2": [],
  "#5": [],
  "#6": [],
  "Cooper": [],
  "#7": [],
  "SL_#1": [],
  "SL_#2": [],
});

function formatMachineName(machine: string) {
  return machine.replace(/#/g, "<span class='hashtag'>#</span>").replace(/_/g, " ");
}
function removeOrder(machine: string, orderIndex: number) {
  if (machineQueues[machine]) {
    machineQueues[machine].splice(orderIndex, 1);
  }
}

const myTheme = themeAlpine
    .withPart(colorSchemeDarkBlue);
</script>

<template>
  <div class="ag-grid-tab">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Paste CSV or Excel rows</h3>
        <textarea v-model="rawCsv" placeholder="Paste CSV or Excel rows here"></textarea>
        <div class="modal-actions">
          <button class="btn" @click="applyCsv">Apply</button>
          <button class="btn" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Machine Queues -->
    <div class="util-group">
      <div class="toolbar-header">
        <div class="header">Better Jomar!</div>
        <div class="toolbar">
          <div><button class="btn" @click="openModal">➕ Data</button></div>
          <!-- Job Type Filter -->
          <div class="contextual-filter-container">
            <div class="filter-button-group">
              <button class="btn filter-main-btn" @click="cycleJobTypeFilterOptions">
                {{ jobTypeFilterButtonText }}
              </button>
              <button class="btn filter-arrow-btn" @click.stop="showDropdown = !showDropdown">▼</button>
            </div>
            <div v-if="showDropdown" id="filter-dropdown-menu" class="filter-dropdown-menu">
              <button class="btn" @click="selectFilterOption('all')" :class="{ active: currentFilterState === 'all' }">All Jobs</button>
              <button class="btn" @click="selectFilterOption('inspection')" :class="{ active: currentFilterState === 'inspection' }">Inspection</button>
              <button class="btn" @click="selectFilterOption('slitter')" :class="{ active: currentFilterState === 'slitter' }">Slitter</button>
              <button class="btn" @click="selectFilterOption('mill')" :class="{ active: currentFilterState === 'mill' }">Kickouts</button>
            </div>
          </div>
          <!-- Date Filter -->
          <div class="contextual-filter-container">
            <div class="filter-button-group">
              <button class="btn filter-main-btn" @click="cycleDateFilterOptions">
                {{ dateFilterButtonText }}
              </button>
              <button class="btn filter-arrow-btn" @click.stop="showDateDropdown = !showDateDropdown">▼</button>
            </div>
            <div v-if="showDateDropdown" class="filter-dropdown-menu">
              <button class="btn" @click="selectDateFilterOption('all')" :class="{ active: currentDateFilterState === 'all' }">All Dates</button>
              <button class="btn" @click="selectDateFilterOption('thisWeek')" :class="{ active: currentDateFilterState === 'thisWeek' }">This Week</button>
              <button class="btn" @click="selectDateFilterOption('nextWeek')" :class="{ active: currentDateFilterState === 'nextWeek' }">Next Week</button>
            </div>
          </div>
        </div>
      </div>
      <div class="machines">
        <div
          v-for="machine in machinesToShow"
          :key="machine"
          class="machine-card"
          :id="machine"
        >
          <div class="machine-name" v-html="formatMachineName(machine)"></div>
          <div class="machine-orders">
            <div
              v-for="(order, index) in machineQueues[machine]"
              :key="order.id"
              class="order-card"
              draggable="true"
            >
            <button
              class="remove-order-btn"
              @click.stop="removeOrder(machine, index)"
              title="Remove order"
            >
              ✕
            </button>
              <div class="order-id">{{ order.fgMo }}</div>
              <div class="order-item">{{ order.fgItemID }}</div>
              <div class="order-date">{{ formatDateCell({ value: order.soPromiseDate }) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ag-theme-alpine">
      <AgGridVue class="ag-grid" :theme="myTheme" :rowData="rowData" :grid-options="gridOptions" />
    </div>
  </div>
</template>
