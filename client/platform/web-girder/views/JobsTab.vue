<script lang="ts">
import {
  defineComponent, onBeforeUnmount, reactive, toRefs,
} from '@vue/composition-api';
import type { GirderJob } from '@girder/components/src';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { all } from '@girder/components/src/components/Job/status';
import { useGirderRest, useNotificationBus } from '../plugins/girder';

export default defineComponent({
  name: 'JobsTab',
  setup() {
    const girderRest = useGirderRest();
    const notificationBus = useNotificationBus();
    const jobStatus = all();
    const data = reactive({
      runningJobIds: [] as string[],
    });

    function handleNotification({ data: job }: { data: GirderJob }) {
      const jobId = job._id;
      switch (job.status) {
        case jobStatus.RUNNING.value:
          if (data.runningJobIds.indexOf(jobId) === -1) {
            data.runningJobIds.push(jobId);
          }
          break;
        case jobStatus.CANCELED.value:
          // fall through
        case jobStatus.SUCCESS.value:
          // fall through
        case jobStatus.ERROR.value:
          if (data.runningJobIds.indexOf(jobId) !== -1) {
            data.runningJobIds.splice(data.runningJobIds.indexOf(jobId), 1);
          }
          break;
        default:
          break;
      }
    }

    async function created() {
      const { data: runningJobs } = await girderRest.get<GirderJob[]>('/job', {
        params: {
          statuses: `[${jobStatus.RUNNING.value}]`,
        },
      });
      data.runningJobIds = runningJobs.map((job) => job._id);
      notificationBus.$on('message:job_status', handleNotification);
    }

    onBeforeUnmount(() => {
      notificationBus.$off('message:job_status', handleNotification);
    });

    created();

    return toRefs(data);
  },
});
</script>

<template>
  <v-tab to="/jobs">
    Jobs
    <v-badge
      :value="runningJobIds.length"
      overlap
      bottom
      offset-x="-6"
      offset-y="16"
    >
      <template slot="badge">
        <v-icon
          dark
          class="rotate"
        >
          mdi-autorenew
        </v-icon>
      </template>
      <v-icon>mdi-format-list-checks</v-icon>
    </v-badge>
  </v-tab>
</template>
