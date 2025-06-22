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

  function parseCsv(csv: string) {
    const lines = csv.trim().split("\n");
    // also check if the first line has  'Available Master Qty' in it
    if (lines.length > 0 && lines[0].startsWith("*") && lines[0].includes("Available Master Qty")) {
      lines.shift();
    }
    const parsed = lines.map((line) => {
      const cells = line.split("	").map((cell) => cell.trim());
      return {
        id: cells[0]?.trim() || "",
        qualityStatus: cells[1]?.trim() || "",
        status: cells[2]?.trim() || "",
        moStatus: cells[3]?.trim() || "",
        rollsToPack: cells[4]?.trim() || "",
        rollsToTransfer: cells[5]?.trim() || "",
        skidsLeftToTransfer: cells[6]?.trim() || "",
        fabToInspectUnassign: cells[7]?.trim() || "",
        moPromiseDate: cells[8]?.trim() || "",
        soPromiseDate: cells[9]?.trim() || "",
        fgPanelItems: cells[10]?.trim() || "",
        fgItemID: cells[11]?.trim() || "",
        fgMo: cells[12]?.trim() || "",
        shipToCustomer: cells[13]?.trim() || "",
        shipToCustomerName: cells[14]?.trim() || "",
        coreSize: cells[15]?.trim() || "",
        aGradeCompleted: cells[16]?.trim() || "",
        fgReqQty: cells[17]?.trim() || "",
        openQty: cells[18]?.trim() || "",
        extrusionCompleted: cells[19]?.trim() || "",
        fabMetresProd: cells[20]?.trim() || "",
        numOfAframes: cells[21]?.trim() || "",
        fabMo: cells[22]?.trim() || "",
        availableMasterQty: cells[23]?.trim() || "",
        fabItem: cells[24]?.trim() || "",
        fabDescription: cells[25]?.trim() || "",
        soldTo: cells[26]?.trim() || "",
        prodStructure: cells[27]?.trim() || "",
        pri: cells[28]?.trim() || "",
        type: cells[29]?.trim() || "",
        dest: cells[30]?.trim() || "",
        targetRollLen: cells[31]?.trim() || "",
        bagsRequired: cells[32]?.trim() || "",
        assignedMachine: cells[33]?.trim() || "",
        scheduledMachine: cells[34]?.trim() || "",
        activity: cells[35]?.trim() || "",
        hrs: cells[36]?.trim() || "",
        days: cells[37]?.trim() || "",
        scheduleCompleteDate: cells[38]?.trim() || "",
      };
    });
    rowData.value = convertNumericFields(parsed);
  }

  return {
    rowData,
    parseCsv,
  };
}
