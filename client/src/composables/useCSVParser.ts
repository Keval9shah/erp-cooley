import { ref } from 'vue'

export function useCsvParser() {
  const rowData = ref<any[]>([])

  function parseCsv(csv: string) {
    const lines = csv.trim().split('\n')
    rowData.value = lines.map(line => {
      const cells = line.split(',')
      return {
        task: cells[0]?.trim() || '',
        assignee: cells[1]?.trim() || '',
        status: cells[2]?.trim() || '',
        dueDate: cells[3]?.trim() || '',
      }
    })
  }

  return {
    rowData,
    parseCsv,
  }
}
