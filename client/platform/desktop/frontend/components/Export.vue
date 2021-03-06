<script lang="ts">
import {
  defineComponent, reactive, computed, toRef, watch,
} from '@vue/composition-api';
import { loadMetadata, exportDataset } from 'platform/desktop/frontend/api';
import type { JsonMeta } from 'platform/desktop/constants';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const data = reactive({
      menuOpen: false,
      excludeFiltered: false,
      activator: 0,
      err: null as unknown,
      meta: null as JsonMeta | null,
      outPath: '',
    });

    watch(toRef(data, 'menuOpen'), async (newval) => {
      if (newval) {
        data.meta = await loadMetadata(props.id);
      } else {
        data.err = null;
        data.outPath = '';
      }
    });

    const thresholds = computed(() => (
      data.meta
        ? Object.keys(data.meta.confidenceFilters || {})
        : []));

    async function doExport() {
      try {
        data.err = null;
        data.outPath = await exportDataset(props.id, data.excludeFiltered);
      } catch (err) {
        data.err = err;
        throw err;
      }
    }

    return {
      data,
      doExport,
      thresholds,
    };
  },
});
</script>

<template>
  <v-menu
    v-model="data.menuOpen"
    :close-on-content-click="false"
    :nudge-width="280"
    offset-y
    max-width="280"
  >
    <template #activator="{ on: menuOn }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltipOn }">
          <v-btn
            class="ma-0"
            text
            :small="small"
            v-on="{ ...tooltipOn, ...menuOn }"
          >
            <v-icon color="accent">
              mdi-export
            </v-icon>
            <span
              v-show="!$vuetify.breakpoint.mdAndDown"
              class="pl-1"
            >
              Export
            </span>
          </v-btn>
        </template>
        <span>export annotation data</span>
      </v-tooltip>
    </template>
    <template>
      <v-card v-if="data.menuOpen">
        <v-card-title>
          Export options
        </v-card-title>

        <v-card-text class="pb-0">
          <v-dialog
            max-width="600"
            persistent
            :value="data.err"
            :overlay-opacity="0.8"
          >
            <v-card outlined>
              <v-card-text class="pa-3">
                <v-card-text class="text-h4">
                  Error
                </v-card-text>
                <v-alert
                  type="error"
                >
                  {{ data.err }}
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  @click="data.err = null"
                >
                  <v-icon>mdi-close</v-icon>
                  Dismiss
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-alert
            v-if="data.outPath"
            dense
            class="text-caption"
            type="success"
          >
            Export succeeded.
          </v-alert>
          <div>Export to VIAME CSV format</div>
          <template v-if="thresholds.length">
            <v-checkbox
              v-model="data.excludeFiltered"
              label="exclude tracks below confidence threshold"
              dense
              hide-details
            />
            <div
              v-if="data.meta && data.meta.confidenceFilters"
              class="py-2"
            >
              <div>Current thresholds:</div>
              <span
                v-for="(val, key) in data.meta.confidenceFilters"
                :key="key"
                class="pt-2"
              >
                ({{ key }}, {{ val }})
              </span>
            </div>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            depressed
            block
            @click="doExport"
          >
            <span>export detections</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>
</template>
