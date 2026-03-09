import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { getInspectionJobs, getMachineQueue, hasChangedSince, getClosedInspectionJobs } from "../supabase";
import { useStorage } from '@vueuse/core';

export const useInspectionStore = defineStore("inspection", () => {
  const jobs = ref<any[]>([]);
  const closedJobs = ref<any[]>([]);
  const storeMachineQueues = reactive<Record<string, any[]>>({
    "#2": [], "#5": [], "#6": [], "Cooper": [], "#7": [], "SL_#1": [], "SL_#2": [],
  });

  const jobsLoaded = ref(false);
  const closedJobsLoaded = ref(false);
  const queuesLoaded = ref(false);

  // ─── Cache (all declared at top level, not inside functions) ─────
  const jobsCache = useStorage<any[]>("inspection_jobs", []);
  const jobsTimestamp = useStorage<number>("inspection_jobs_timestamp", 0);

  const closedJobsCache = useStorage<any[]>("closed_inspection_jobs", []);
  const closedJobsTimestamp = useStorage<number>("closed_inspection_jobs_timestamp", 0);

  const queuesCache = useStorage<{ machine_name: string; jobs: any[] }[]>("machine_queues", []);
  const queuesTimestamp = useStorage<number>("machine_queues_timestamp", 0);

  // ─── Fetch Functions ─────────────────────────────────────────────
  async function loadJobs() {
    if (jobsLoaded.value) return;

    const hasCachedJobs = jobsCache.value.length > 0 && jobsTimestamp.value !== 0;
    const changed = hasCachedJobs ? await hasChangedSince("inspection_jobs", jobsTimestamp.value) : true;

    if (!changed && hasCachedJobs) {
      jobs.value = jobsCache.value;
    } else {
      jobs.value = await getInspectionJobs();
      jobsCache.value = jobs.value;
      jobsTimestamp.value = Date.now();
    }

    jobsLoaded.value = true;
  }

  async function loadClosedJobs() {
    if (closedJobsLoaded.value) return;

    const hasCachedJobs = closedJobsCache.value.length > 0 && closedJobsTimestamp.value !== 0;
    const changed = hasCachedJobs ? await hasChangedSince("inspection_jobs", closedJobsTimestamp.value) : true;

    if (!changed && hasCachedJobs) {
      closedJobs.value = closedJobsCache.value;
    } else {
      closedJobs.value = await getClosedInspectionJobs();
      closedJobsCache.value = closedJobs.value;
      closedJobsTimestamp.value = Date.now();
    }

    closedJobsLoaded.value = true;
  }

  async function loadQueues() {
    if (queuesLoaded.value) return;

    const hasCachedJobs = queuesCache.value.length > 0 && queuesTimestamp.value !== 0;
    const changed = hasCachedJobs ? await hasChangedSince("machine_queues", queuesTimestamp.value) : true;

    if (!changed && hasCachedJobs) {
      queuesCache.value.forEach((item) => {
        storeMachineQueues[item.machine_name] = item.jobs;
      });
    } else {
      Object.keys(storeMachineQueues).forEach((k) => (storeMachineQueues[k] = []));
      const queue = await getMachineQueue();
      queue.forEach((item) => {
        storeMachineQueues[item.machine_name].push(item.inspection_jobs);
      });
      queuesCache.value = Object.entries(storeMachineQueues).map(([machine_name, jobs]) => ({ machine_name, jobs }));
      queuesTimestamp.value = Date.now();
    }

    queuesLoaded.value = true;
  }

  function invalidate(target?: "jobs" | "closedJobs" | "queues") {
    if (!target || target === "jobs") {
      jobsLoaded.value = false;
      jobsCache.value = [];
      jobsTimestamp.value = 0;
    }
    if (!target || target === "closedJobs") {
      closedJobsLoaded.value = false;
      closedJobsCache.value = [];
      closedJobsTimestamp.value = 0;
    }
    if (!target || target === "queues") {
      queuesLoaded.value = false;
      queuesCache.value = [];
      queuesTimestamp.value = 0;
    }
  }

  return {
    jobs, closedJobs, storeMachineQueues,
    jobsLoaded, closedJobsLoaded, queuesLoaded,
    loadJobs, loadClosedJobs, loadQueues,
    invalidate,
  };
});