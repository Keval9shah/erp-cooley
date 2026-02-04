import { ref, computed } from "vue";

export function useGridFilters(gridApi: any, resizeCells: () => void, registerDropZones: () => void) {
  const currentFilterState = ref<string>("inspection");
  const currentDateFilterState = ref<string>("all");

  function getWeekDay(weekPosition: string, weekNumber: number): string {
    const today = new Date();
    const dayNumber = weekPosition == "start" ? -1 : 8;
    const diff = (dayNumber + weekNumber * 7) - today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
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

  function applyGridFilter(filterType: string) {
    const model = gridApi.value?.getFilterModel() ?? {};

    // const stateUpdates = [jobTypeFilterModels[currentFilterState.value], dateFilterModels[currentDateFilterState.value]];
    const stateUpdates = filterType === "job" ? [jobTypeFilterModels[currentFilterState.value]] : [dateFilterModels[currentDateFilterState.value]];

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
      scrollFunction();
    }, 0);
    resizeCells();
  }

  function scrollFunction(){
    const machineCards = document.querySelectorAll('.machine-card');
    machineCards.forEach(machineCard => {
      const machineName = machineCard.querySelector('.machine-name') as HTMLElement;
      machineCard.addEventListener('scroll', () => {
        if (machineCard.scrollTop > machineName.offsetTop) {
          machineName.classList.add('scrolled');
        } else {
          machineName.classList.remove('scrolled');
        }
      });
    });
  }

  let currentJobTypeIndex = 0;
  const noOfToggles = 2;
  let jobTypeFilterStates: string[] = ["inspection", "slitter", "mill"];

  function cycleJobTypeFilterOptions() {
    currentJobTypeIndex = (currentJobTypeIndex + 1) % noOfToggles;
    currentFilterState.value = jobTypeFilterStates[currentJobTypeIndex];
    applyGridFilter("job");
  }

  let currentDateIndex = 0;
  const dateFilterStates: string[] = ["all", "thisWeek", "nextWeek"];

  function cycleDateFilterOptions() {
    currentDateIndex = (currentDateIndex + 1) % dateFilterStates.length;
    currentDateFilterState.value = dateFilterStates[currentDateIndex];
    applyGridFilter("date");
  }

  const machinesToShow = ref(["#2", "#5", "#6", "Cooper", "#7", "SL_#1", "SL_#2"]);

  return {
    jobTypeFilterButtonText,
    dateFilterButtonText,
    machinesToShow,
    cycleJobTypeFilterOptions,
    cycleDateFilterOptions,
    scrollFunction
  };
}
