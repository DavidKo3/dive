
<script>
export default {
  props: {
    state: {
      type: String,
      require: true,
      default: 'default',
    },
  },
  data() {
    return {
      categories: [
        {
          name: 'General',
          data: [
            {
              name: 'Select Track', icon: 'mdi-mouse', actions: ['Left Click Mouse'], description: 'Left click a rectangle to select a detection/track',
            },
            {
              name: 'Zoom In/Out', icon: 'mdi-mouse', actions: ['Scrollwheel Up/Down'], description: 'use scrollwheel to zoom in and out',
            },
            {
              name: 'Zoom Area', icon: 'mdi-mouse', actions: ['Shift + Mouse Movement'], description: 'Zoom into a specific area',
            },
            {
              name: 'Reset zoom', icon: 'mdi-keyboard', actions: ['R Key'], description: 'Reset pan and zoom',
            },
            {
              name: 'Select Track', icon: 'mdi-keyboard', actions: ['Up/Down Arrows'], description: 'Select Track',
            },
          ],
        },
        {
          name: 'Editing Mode',
          data: [
            {
              name: 'New Track', icon: 'mdi-keyboard', actions: ['N Key'], description: 'Create a new Track/Detection',
            },
            {
              name: 'Edit Track', icon: 'mdi-mouse', actions: ['Right Click Mouse'], description: 'Right click a track to enter Edit Mode',
            },
            {
              name: 'Add Head/Tail', icon: 'mdi-keyboard', actions: ['H Key - Head', 'T Key - Tail'], description: 'While a track is selected add head/tail annotations',
            },
          ],
        },
        {
          name: 'Selected Mode',
          data: [
            {
              name: 'First Frame', icon: 'mdi-keyboard', actions: ['Enter'], description: 'Go to first frame of selected track',
            },
            {
              name: 'Delete', icon: 'mdi-keyboard', actions: ['Delete'], description: 'Delete selected track',
            },
            {
              name: 'Edit Type', icon: 'mdi-keyboard', actions: ['Shift + Enter'], description: 'Choose/Edit track type',
            },
          ],
        },
        {
          name: 'Playback',
          data: [
            {
              name: 'Play', icon: 'mdi-keyboard', actions: ['Spacebar'], description: 'Spacebar will pause and start playback',
            },
            {
              name: 'Prev Frame', icon: 'mdi-keyboard', actions: ['F Key'], description: 'skip ahead 1 frame',
            },
            {
              name: 'Next Frame', icon: 'mdi-keyboard', actions: ['D Key'], description: 'skip back 1 frame',
            },
          ],
        },
      ],
    };
  },
};
</script>
<template>
  <div class="d-flex justify-space-around flex-wrap pa-4">
    <v-card
      v-for="category in categories"
      id="helpdialog"
      :key="category.name"
      outlined
      flat
      width="360"
      class="my-3"
    >
      <v-card-title>{{ category.name }}</v-card-title>
      <v-tooltip
        v-for="(item, index) in category.data"
        :key="`${item.name}_${index}`"
        color="red"
        top
      >
        <template v-slot:activator="{ on }">
          <v-row
            class="helpContextRow ma-0 align-center"
            v-on="on"
          >
            <v-col cols="4">
              {{ item.name }}
            </v-col>
            <v-col cols="2">
              <v-icon>{{ item.icon }}</v-icon>
            </v-col>
            <v-col col="6">
              <div
                v-for="action in item.actions"
                :key="action"
              >
                {{ action }}
              </div>
            </v-col>
          </v-row>
        </template>
        <span> {{ item.description }}</span>
      </v-tooltip>
    </v-card>
  </div>
</template>
<style lang="scss" scoped>

#helpdialog{
  font-family: monospace;
  font-size: 12px;
  .helpContextRow{
    &:hover{
      background-color: var(--v-dropzone-base);
    }
  }
}
</style>
