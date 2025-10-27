<script setup lang="ts">
import { useGridFilters } from "../composables/useGridFilters";
import { ref, onMounted, reactive, toRaw } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { useCsvParser } from "../composables/useCSVParser";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { getInspectionJobs, insertMachineQueue, removeMachineQueue, getMachineQueue } from "../supabase";

import { themeAlpine, ModuleRegistry, AllCommunityModule, colorSchemeDarkBlue } from "ag-grid-community";
import type { GridApi, GridOptions, ColDef, RowStyle, RowDropZoneParams } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const { Data, parseCsv } = useCsvParser();
const rawCsv = ref("");
const showModal = ref(false);
const isMobile = ref(window.innerWidth < 768);
const gridApi = ref<GridApi | null>(null);
const { jobTypeFilterButtonText, dateFilterButtonText, machinesToShow, cycleJobTypeFilterOptions, cycleDateFilterOptions, scrollFunction } = useGridFilters(gridApi, resizeCells, registerDropZones);

function insertComma(params: any) {
  return params.value != null ? params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}
const columnDefs: ColDef[] = [
  { headerName: "MO Status", field: "moStatus" },
  { headerName: "SO Promise Date", field: "soPromiseDate", valueGetter: (params) => (params.data.soPromiseDate ? new Date(params.data.soPromiseDate + "T00:00") : null), valueFormatter: formatDateCell, filter: "agDateColumnFilter" },
  { headerName: "Fab to Inspect/Unassign", field: "fabToInspectUnassign", valueFormatter: insertComma },
  { headerName: "FG Panel Items", field: "fgPanelItems", width: 135 },
  { headerName: "FG MO", field: "fgMo" },
  {
    headerName: "Fab Item",
    field: "fabItem",
    valueGetter: (params) => {
      const row = params.data;
      return row.fabMo && row.fabMo.endsWith("TER") ? row.fabItem : `${row.fabItem} (${row.fabMo.replace(/^0+/, "")})`;
    },
  },
  { headerName: "Customer", field: "shipToCustomerName" },
  { headerName: "Core Size", field: "coreSize" },
  { headerName: "A Grade Completed", field: "aGradeCompleted", valueFormatter: insertComma },
  { headerName: "FG Req Qty", field: "fgReqQty", valueFormatter: insertComma },
  { headerName: "Fab Metres Prod.", field: "fabMetresProd", valueFormatter: insertComma },
  { headerName: "Available Master Qty", field: "availableMasterQty", valueFormatter: insertComma },
  // { headerName: "Fab MO", field: "fabMo" },
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
  { headerName: "Open Qty", field: "openQty", valueFormatter: insertComma },
  { headerName: "MO Promise Date", field: "moPromiseDate", valueGetter: (params) => (params.data.moPromiseDate ? new Date(params.data.moPromiseDate) : null), valueFormatter: formatDateCell, filter: "agDateColumnFilter" },
  { headerName: "Ship To Customer", field: "shipToCustomer" },
  { headerName: "FG Item ID", field: "fgItemID" },
];

const columnDefsWithTooltips = columnDefs.map((col) => ({
  ...col,
  headerTooltip: col.headerName,
}));

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  rawCsv.value = "";
}
async function applyCsv() {
  await parseCsv(rawCsv.value);
  resizeCells();
  rawCsv.value = "";
  showModal.value = false;
  (await getMachineQueue()).forEach((item) => {
    const queue = machineQueues[item.machine_name];
    const newJob = item.inspection_jobs;
    const existingIndex = queue.findIndex((job: any) => job.order_id === (newJob as any).order_id);

    if (existingIndex !== -1) {
      queue[existingIndex] = newJob;
    } else {
      queue.push(newJob);
    }
    gridApi.value?.applyTransaction({ remove: [{ order_id: (item.inspection_jobs as any).order_id }] });
  });
}

const machineQueues = reactive<Record<string, any[]>>({
  "#2": [],
  "#5": [],
  "#6": [],
  Cooper: [],
  "#7": [],
  "SL_#1": [],
  "SL_#2": [],
});

const selectedMachine = ref("");
onMounted(async () => {
  selectedMachine.value = machinesToShow.value[0];
  if (!isMobile.value) {
    Data.value = await getInspectionJobs();
  }
  (await getMachineQueue()).forEach((item) => {
    machineQueues[item.machine_name].push(item.inspection_jobs);

    !isMobile.value && gridApi.value?.applyTransaction({ remove: [{ order_id: (item.inspection_jobs as any).order_id }] });
  });
  !isMobile.value && scrollFunction();
});

function formatDateCell(params: any, appendStr = "") {
  const raw = params.value;
  if (!raw) return "";
  const date = new Date(raw + appendStr);
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

    if (registeredDropZones[id]) {
      gridApi.value?.removeRowDropZone(registeredDropZones[id]);
    }

    const dropZoneParams: RowDropZoneParams = {
      getContainer: () => container,
      onDragStop: async (dragParams: any) => {
        const orderData = dragParams.node.data;
        // Add to machine
        machineQueues[container.id].push(orderData);
        await insertMachineQueue(orderData.order_id, container.id);

        // Remove from grid efficiently
        gridApi.value?.applyTransaction({ remove: [{ order_id: orderData.order_id }] });
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
  getRowId: (params) => params.data.order_id,
  defaultColDef: {
    filter: "agTextColumnFilter",
    floatingFilter: true,
    sortable: true,
    resizable: true,
    lockPosition: true,
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
    const ratio = getRatio(data);

    if (ratio < 20 && data.fgReqQty > data.aGradeCompleted) {
      return { backgroundColor: "#1a1a1a" };
    }
    return {} as RowStyle;
  },
};

const getRatio = (data: any) => {
  const req = data.fgReqQty;
  const noOfPanels = getNumberOfPanels(data.fgPanelItems);
  if (req === 0) return 100;
  const calculatedValueForRatio = (data.fabToInspectUnassign + data.availableMasterQty) * noOfPanels;
  return (calculatedValueForRatio * 100) / (req - data.aGradeCompleted);
};

function formatMachineName(machine: string) {
  return machine.replace(/#/g, "<span class='hashtag'>#</span>").replace(/_/g, " ");
}

async function removeOrder(machine: string, orderIndex: number) {
  if (machineQueues[machine]) {
    const removedOrder = toRaw(machineQueues[machine].splice(orderIndex, 1)[0]);
    await removeMachineQueue(removedOrder.order_id, machine);
    if (removedOrder) {
      gridApi.value?.applyTransaction({ add: [removedOrder] }); // Add back to grid efficiently
    }
  }
}

const myTheme = themeAlpine.withPart(colorSchemeDarkBlue);
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

    <Splitpanes class="default-theme" horizontal style="height: 100vh">
      <!-- Machine Queues -->
      <Pane min-size="35" :max-size="!isMobile ? '70' : '100'" :size="isMobile ? '100' : '48'">
        <div class="util-group" v-if="!isMobile">
          <div v-if="!isMobile" class="toolbar-header">
            <button class="textile btn">
              <span>🧵</span>
              <div>Textile</div>
            </button>
            <div class="toolbar">
              <button class="btn" @click="openModal">✚ Data</button>
              <!-- Job Type Filter -->
              <button class="btn filter-main-btn" @click="cycleJobTypeFilterOptions">{{ jobTypeFilterButtonText }}</button>
              <!-- Date Filter -->
              <button class="btn filter-main-btn" @click="cycleDateFilterOptions">{{ dateFilterButtonText }}</button>
            </div>
          </div>
          <div class="machines">
            <div v-for="machine in machinesToShow" :key="machine" class="machine-card" :id="machine">
              <div class="machine-name" v-html="formatMachineName(machine)"></div>
              <div class="machine-orders">
                <div v-for="(order, index) in machineQueues[machine]" :key="order.fgMo + '-' + index" :class="order.moStatus === 'Closed' ? 'order-card bg-red' : 'order-card'" draggable="true">
                  <button class="remove-order-btn" @click.stop="removeOrder(machine, index)" title="Remove order">✕</button>
                  <div class="order-id">{{ order.fgMo }} - {{ order.shipToCustomerName ? order.shipToCustomerName : order.fabItem }}</div>
                  <template v-if="order.shipToCustomerName">
                    <div class="order-item">
                      <span :class="getRatio(order) < 20 ? 'low-ratio' : ''">{{ order.fabItem }} {{ order.fabMo == "USE MASTER" ? "" : "(" + order.fabMo.replace(/^0+/, "") + ")" }}</span> | {{ order.coreSize }}
                    </div>
                  </template>
                  <div class="order-date">{{ formatDateCell({ value: order.soPromiseDate }, "T00:00") }}</div>
                  <div class="order-qty">{{ order.aGradeCompleted }} / {{ order.fgReqQty }} ({{ ((parseFloat(order.hrs) * parseFloat(order.openQty)) / parseFloat(order.fgReqQty)).toFixed(2) }} hrs)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="util-group" v-if="isMobile">
          <div class="machines" v-if="selectedMachine">
            <div v-for="(order, index) in machineQueues[selectedMachine]" :key="order.fgMo + '-' + index" :class="order.moStatus === 'Closed' ? 'order-card bg-red' : 'order-card'" draggable="true">
              <div class="order-id">{{ order.fgMo }} - {{ order.shipToCustomerName ? order.shipToCustomerName : order.fabItem }}</div>
              <template v-if="order.shipToCustomerName">
                <div class="order-item">
                  <span :class="getRatio(order) < 20 ? 'low-ratio' : ''">{{ order.fabItem }} {{ order.fabMo == "USE MASTER" ? "" : "(" + order.fabMo.replace(/^0+/, "") + ")" }}</span> | {{ order.coreSize }}
                </div>
              </template>
              <div class="order-date">{{ formatDateCell({ value: order.soPromiseDate }, "T00:00") }}</div>
              <div class="order-qty">{{ order.aGradeCompleted }} / {{ order.fgReqQty }} ({{ ((parseFloat(order.hrs) * parseFloat(order.openQty)) / parseFloat(order.fgReqQty)).toFixed(2) }} hrs)</div>
            </div>
          </div>
          <div class="tabs">
            <div v-for="machine in machinesToShow" v-html="formatMachineName(machine)" :key="machine" class="tab" :class="{ active: selectedMachine === machine }" @click="selectedMachine = machine; console.log('Selected machine:', machine)"></div>
          </div>
        </div>
      </Pane>
      <Pane v-if="!isMobile" max-size="65">
        <div class="ag-theme-alpine">
          <AgGridVue class="ag-grid" :theme="myTheme" :rowData="Data" :grid-options="gridOptions" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
