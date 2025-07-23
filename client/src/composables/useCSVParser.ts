import { ref } from "vue";

export function useCsvParser() {
  const rowData = ref<any[]>([]);

  function convertFields(data: any[]) {
    return data.map((row) => {
      // Cleaning rules for specific fields
      const cleanRules: Record<string, ((val: any) => string | Date)[]> = {
        fgMo: [(val) => val.replace(/^0+/, "")],
        fabMo: [(val) => val.replace(/^0+/, ""), (val) => val.replace(/^USE\s+/, "")],
        coreSize: [(val) => val.replace(/CR/g, "")],
        moPromiseDate: [(val) => (val ? new Date(val) : "")],
        soPromiseDate: [(val) => (val ? new Date(val) : "")],
        scheduleCompleteDate: [(val) => (val ? new Date(val) : "")],
        assignedMachine: [
          (val) => {
            const scheduled = row.scheduledMachine;
            return val === scheduled || !scheduled ? val : `${val} (${scheduled})`;
          },
        ],
        extrusionCompleted: [(val) => (val === "true" ? "🟢" : "🔴")],
        shipToCustomerName: [
          (val) =>
            val
              .split(" ")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" "),
        ],
      };

      Object.keys(cleanRules).forEach((key) => {
        if (row[key]?.length > 0) {
          cleanRules[key].forEach((rule) => {
            row[key] = rule(row[key]);
          });
        }
      });

      return {
        ...row,
      };
    });
  }

  // prettier-ignore
  const fields = [
    "id", 
    "qualityStatus", 
    "status", 
    "moStatus", 
    "rollsToPack", 
    "rollsToTransfer",
    "skidsLeftToTransfer", 
    "fabToInspectUnassign", 
    "moPromiseDate", 
    "soPromiseDate",
    "fgPanelItems", 
    "fgItemID", 
    "fgMo", 
    "shipToCustomer", 
    "shipToCustomerName",
    "coreSize", 
    "aGradeCompleted", 
    "fgReqQty", 
    "openQty", 
    "extrusionCompleted",
    "fabMetresProd", 
    "numOfAframes", 
    "fabMo", 
    "availableMasterQty", 
    "fabItem",
    "fabDescription", 
    "soldTo", 
    "prodStructure", 
    "pri", 
    "type", 
    "dest",
    "targetRollLen", 
    "bagsRequired", 
    "assignedMachine", 
    "scheduledMachine",
    "activity", 
    "hrs", 
    "days", 
    "scheduleCompleteDate"
  ]

  function parseCsv(csv: string) {
    const lines = csv.trim().split("\n");
    if (lines.length > 0 && lines[0].startsWith("*") && lines[0].includes("FG MO")) {
      lines.shift();
    }
    const parsed = lines.map((line) => {
      const cells = line.split("	").map((cell) => cell.trim());
      return fields.reduce((acc, key, index) => {
        acc[key] = cells[index]?.trim() || "";
        return acc;
      }, {} as Record<string, string>);
    });
    rowData.value = convertFields(parsed);
  }

  return {
    rowData,
    parseCsv,
  };
}
