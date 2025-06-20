import { ref } from 'vue'

export function useCsvParser() {
  const rowData = ref<any[]>([])

  function parseCsv(csv: string) {
    const lines = csv.trim().split('\n')
    rowData.value = lines.map(line => {
      const cells = line.split(',')
      return {
        qualityStatus: cells[0]?.trim() || '',
        moStatus: cells[1]?.trim() || '',
        rollsToPack: cells[2]?.trim() || '',
        rollsToTransfer: cells[3]?.trim() || '',
        skidsLeftToTransfer: cells[4]?.trim() || '',
        fabToInspectUnassign: cells[5]?.trim() || '',
        moPromiseDate: cells[6]?.trim() || '',
        soPromiseDate: cells[7]?.trim() || '',
        fgPanelItems: cells[8]?.trim() || '',
        fgMo: cells[9]?.trim() || '',
        shipToCustomer: cells[10]?.trim() || '',
        coreSize: cells[11]?.trim() || '',
        aGradeCompleted: cells[12]?.trim() || '',
        fgReqQty: cells[13]?.trim() || '',
        openQty: cells[14]?.trim() || '',
        extrusionCompleted: cells[15]?.trim() || '',
        fabMetresProd: cells[16]?.trim() || '',
        numOfAframes: cells[17]?.trim() || '',
        fabMo: cells[18]?.trim() || '',
        availableMasterQty: cells[19]?.trim() || '',
        fabItem: cells[20]?.trim() || '',
        fabDescription: cells[21]?.trim() || '',
        soldTo: cells[22]?.trim() || '',
        prodStructure: cells[23]?.trim() || '',
        pri: cells[24]?.trim() || '',
        type: cells[25]?.trim() || '',
        dest: cells[26]?.trim() || '',
        targetRollLen: cells[27]?.trim() || '',
        bagsRequired: cells[28]?.trim() || '',
        assignedMachine: cells[29]?.trim() || '',
        scheduledMachine: cells[30]?.trim() || '',
        activity: cells[31]?.trim() || '',
        hrs: cells[32]?.trim() || '',
        days: cells[33]?.trim() || '',
        scheduleCompleteDate: cells[34]?.trim() || '',
      };
    })
  }

  return {
    rowData,
    parseCsv,
  }
}
