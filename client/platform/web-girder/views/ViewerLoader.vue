<script lang="ts">
import {
  defineComponent, onBeforeUnmount, onMounted, ref, toRef, computed,
} from '@vue/composition-api';
import Viewer from 'dive-common/components/Viewer.vue';
import NavigationTitle from 'dive-common/components/NavigationTitle.vue';
import RunPipelineMenu from 'dive-common/components/RunPipelineMenu.vue';
import JobsTab from './JobsTab.vue';
import { getPathFromLocation } from '../utils';
import Export from './Export.vue';

/**
 * ViewerLoader is responsible for loading
 * data from girder.
 */
export default defineComponent({
  components: {
    Export,
    JobsTab,
    RunPipelineMenu,
    NavigationTitle,
    Viewer,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  // TODO: This will require an import from vue-router for Vue3 compatibility
  async beforeRouteLeave(to, from, next) {
    if (await this.viewerRef.navigateAwayGuard()) {
      next();
    }
  },

  setup(props, { root }) {
    const viewerRef = ref();
    const brandData = toRef(root.$store.state.Brand, 'brandData');
    const location = toRef(root.$store.state.Location, 'location');
    const dataPath = computed(() => getPathFromLocation(location.value));
    onMounted(() => {
      window.addEventListener('beforeunload', viewerRef.value.warnBrowserExit);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', viewerRef.value.warnBrowserExit);
    });

    return { viewerRef, dataPath, brandData };
  },
});
</script>

<template>
  <Viewer
    :id="id"
    ref="viewerRef"
  >
    <template #title>
      <NavigationTitle :name="brandData.name" />
      <v-tabs
        icons-and-text
        hide-slider
        style="flex-basis:0; flex-grow:0;"
      >
        <v-tab :to="dataPath">
          Data
          <v-icon>mdi-database</v-icon>
        </v-tab>
        <JobsTab />
        <v-tab to="/settings">
          Settings<v-icon>mdi-settings</v-icon>
        </v-tab>
      </v-tabs>
    </template>
    <template #title-right>
      <RunPipelineMenu :selected-dataset-ids="[id]" />
      <Export :dataset-id="id" />
    </template>
  </Viewer>
</template>
