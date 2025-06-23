import { ref } from "vue";

export function useCsvParser() {
  const rowData = ref<any[]>([]);

  function convertNumericFields(data: any[]) {
    return data.map((row) => ({
      ...row,
      rollsToPack: Number(row.rollsToPack),
      rollsToTransfer: Number(row.rollsToTransfer),
      skidsLeftToTransfer: Number(row.skidsLeftToTransfer),
      fgMo: Number(row.fgMo),
    }));
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
    if (lines.length > 0 && lines[0].startsWith("*") && lines[0].includes("Available Master Qty")) {
      lines.shift();
    }
    const parsed = lines.map((line) => {
      const cells = line.split("	").map((cell) => cell.trim());
      return fields.reduce((acc, key, index) => {
        acc[key] = cells[index]?.trim() || "";
        return acc;
      }, {} as Record<string, string>);
    });
    rowData.value = convertNumericFields(parsed);
  }

  return {
    rowData,
    parseCsv,
  };
}
