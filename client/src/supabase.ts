import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xrzpwukmfwuyecbuiktd.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
if (!supabaseKey) {
  throw new Error("SUPABASE_KEY environment variable is not set");
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncInspectionJobs(newRows: any[]) {
  const { data:_, error } = await supabase.rpc("sync_inspection_jobs", {
    new_rows: newRows,
  });

  if (error) {
    console.error("RPC sync error:", error);
    return false;
  }

  return true;
}

async function getInspectionJobs() {
  const { data, error } = await supabase.from("inspection_jobs").select("*");
  if (error) {
    console.error("Error fetching inspection jobs:", error);
    return [];
  }
  return data;
}

// function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
//   let timeout: NodeJS.Timeout;
//   return (...args: Parameters<F>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

async function insertMachineQueue(job_id:any, machine_name: string) {
  const { error } = await supabase.from("machine_queue").upsert({
    job_id,
    machine_name,
  });

  if (error) {
    console.error("Failed to update machine_queue:", error);
  }
}

async function removeMachineQueue(job_id:any, machine_name: string) {
  const { error } = await supabase.from("machine_queue").delete().match({
    job_id,
    machine_name,
  });

  if (error) {
    console.error("Failed to remove from machine_queue:", error);
  }
}

async function getMachineQueue() {
  const { data, error } = await supabase
    .from("machine_queue")
    .select(`
      machine_name,
      inspection_jobs (*)
    `);

  if (error) {
    console.error("Error fetching machine queue:", error);
    return [];
  }
  return data;
}

export { syncInspectionJobs, getInspectionJobs, insertMachineQueue, removeMachineQueue, getMachineQueue };
