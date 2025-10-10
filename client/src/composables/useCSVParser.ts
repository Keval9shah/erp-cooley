import { ref } from "vue";
import { syncInspectionJobs, getInspectionJobs } from '../supabase';

export function useCsvParser() {
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
  
  const Data = ref<any[]>([]);
  
  function convertFields(data: any[]) {
    const convertToFloat = (val: any) => (val ? parseFloat(val.replace(/,/g, "")) : 0);
    const convertToInt = (val: any) => (val ? parseInt(val.replace(/,/g, ""), 10) : 0);
    const convertToDate = (val: any) => (val ? new Date(val) : null);
    return data.map((row) => {
      // Cleaning rules for specific fields
      const cleanRules: Record<string, ((val: any) => any)[]> = {
        fgMo: [(val) => val.replace(/^0+/, "")],
        coreSize: [(val) => val.replace(/CR/g, "")],
        fabMetresProd: [convertToFloat],
        rollsToPack: [convertToInt],
        rollsToTransfer: [convertToInt],
        skidsLeftToTransfer: [convertToInt],
        fabToInspectUnassign: [convertToFloat],
        aGradeCompleted: [convertToFloat],
        fgReqQty: [convertToFloat],
        openQty: [convertToFloat],
        availableMasterQty: [convertToFloat],
        hrs: [convertToFloat],
        days: [convertToInt],
        targetRollLen: [convertToFloat],
        moPromiseDate: [convertToDate],
        numOfAframes: [convertToInt],
        soPromiseDate: [convertToDate],
        scheduleCompleteDate: [convertToDate],
        assignedMachine: [
          (val) => {
            const scheduled = row.scheduledMachine;
            return val === scheduled || !scheduled ? val : `${val} (${scheduled})`;
          },
        ],
        extrusionCompleted: [(val) => (val === "true" ? true : false)],
        shipToCustomerName: [
          (val) =>
            val
              .split(" ")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" "),
        ],
      };

      Object.keys(cleanRules).forEach((key) => {
        cleanRules[key].forEach((rule) => {
          row[key] = rule(row[key]);
        });
      });

      return {
        ...row,
      };
    });
  }

  async function parseCsv(csv: string) {
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
    const isSuccess = await syncInspectionJobs(convertFields(parsed));
    if (isSuccess) {
      Data.value = await getInspectionJobs();
    }
  }

  return {
    Data,
    parseCsv,
  };
}
