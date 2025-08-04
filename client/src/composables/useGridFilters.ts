import { ref, computed } from "vue";

export function useGridFilters(gridApi: any, resizeCells: () => void, registerDropZones: () => void) {
  const currentFilterState = ref<string>("all");
  const currentDateFilterState = ref<string>("all");

  const showDropdown = ref(false);
  const showDateDropdown = ref(false);

  function getWeekDay(weekPosition: string, weekNumber: number): string {
    const today = new Date();
    let dayNumber = weekPosition == "start" ? -1 : 8;
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = (day === 0 ? -6 : dayNumber + weekNumber * 7) - day; // Adjust so Monday is start
    today.setDate(today.getDate() + diff);
    return today.toISOString();
  }

  const jobTypeFilterModels: Record<string, Partial<any>> = {
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

  const dateFilterModels: Record<string, Partial<any>> = {
    all: {
      soPromiseDate: undefined,
    },
    thisWeek: {
      soPromiseDate: { type: "lessThan", dateFrom: getWeekDay("end", 0) },
    },
    nextWeek: {
      soPromiseDate: { type: "inRange", dateFrom: getWeekDay("start", 1), dateTo: getWeekDay("end", 1) },
    },
    // thisMonth: {
    //   soPromiseDate: { type: "inRange", dateFrom: getTomorrow() },
    // },
    // nextMonth: {
    //   soPromiseDate: { type: "lessThan", dateFrom: getTomorrow() },
    // },
  };

  const jobTypeFilterButtonText = computed(() => {
    switch (currentFilterState.value) {
      case "all":
        machinesToShow.value = ["#2", "#5", "#6", "Cooper", "#7", "SL_#1", "SL_#2"];
        return "All Jobs";
      case "slitter":
        machinesToShow.value = ["SL_#1", "SL_#2"];
        return "Slitter";
      case "inspection":
        machinesToShow.value = ["#2", "#5", "#6", "Cooper"];
        return "Inspection";
      case "mill":
        machinesToShow.value = ["Cooper", "#7"];
        return "Kickouts";
      default:
        return "Filter Jobs";
    }
  });
  const dateFilterButtonText = computed(() => {
    switch (currentDateFilterState.value) {
      case "all":
        return "All Dates";
      case "thisWeek":
        return "This Week";
      case "nextWeek":
        return "Next Week";
      case "dueTomorrow":
        return "Due Tomorrow";
      default:
        return "Filter Dates";
    }
  });

  function applyGridFilter() {
    const model = gridApi.value?.getFilterModel() ?? {};

    const stateUpdates = [jobTypeFilterModels[currentFilterState.value], dateFilterModels[currentDateFilterState.value]];

    stateUpdates.forEach((update) => {
      Object.entries(update).forEach(([key, value]) => {
        if (value !== undefined) {
          model[key] = value;
        } else {
          delete model[key];
        }
      });
    });

    gridApi.value?.setFilterModel(model);
    setTimeout(() => {
      registerDropZones();
    }, 0);
    resizeCells();
  }

  function selectFilterOption(option: string) {
    currentFilterState.value = option;
    applyGridFilter();
    showDropdown.value = false;
  }

  function selectDateFilterOption(option: string) {
    currentDateFilterState.value = option;
    applyGridFilter();
    showDateDropdown.value = false;
  }

  let currentJobTypeIndex = 0;
  const noOfToggles = 3;
  let jobTypeFilterStates: string[] = ["all", "inspection", "slitter", "mill"];

  function cycleJobTypeFilterOptions() {
    currentJobTypeIndex = (currentJobTypeIndex + 1) % noOfToggles;
    currentFilterState.value = jobTypeFilterStates[currentJobTypeIndex];
    applyGridFilter();
    showDropdown.value = false;
  }

  let currentDateIndex = 0;
  const dateFilterStates: string[] = ["all", "thisWeek", "nextWeek"];

  function cycleDateFilterOptions() {
    currentDateIndex = (currentDateIndex + 1) % dateFilterStates.length;
    currentDateFilterState.value = dateFilterStates[currentDateIndex];
    applyGridFilter();
    showDateDropdown.value = false;
  }

  const machinesToShow = ref(["#2", "#5", "#6", "Cooper", "#7", "SL #1", "SL #2"]);

  return {
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
    cycleDateFilterOptions,
  };
}
