import { ref } from "vue";

export function useCsvParser() {
  const rowData = ref<any[]>([]);

  function convertFields(data: any[]) {
  return data.map((row) => {
    const assigned = row.assignedMachine?.trim() || '';
    const scheduled = row.scheduledMachine?.trim() || '';

    //how to capitalize the shipToCustomerName so from 'GE INC' to 'Ge Inc'
    if (row.shipToCustomerName) {
      row.shipToCustomerName = row.shipToCustomerName
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    ['fgMo', 'fabMo'].forEach((key) => {
      if (row[key] && row[key].length > 0) {
        row[key] = row[key].replace(/^0+/, '').replace(/^USE\s+/, '');
      }
    });

    return {
      ...row,

      // ✅ Convert to Date objects
      moPromiseDate: row.moPromiseDate ? new Date(row.moPromiseDate) : null,
      soPromiseDate: row.soPromiseDate ? new Date(row.soPromiseDate) : null,
      scheduleCompleteDate: row.scheduleCompleteDate ? new Date(row.scheduleCompleteDate) : null,

      // ✅ Data Logic
      assignedMachine:
        assigned === scheduled || !scheduled
          ? assigned
          : `${assigned} (${scheduled})`,
      extrusionCompleted: row.extrusionCompleted === 'true' ? '🟢' : '🔴'
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
    rowData.value = convertFields(parsed);
  }

  return {
    rowData,
    parseCsv,
  };
}
