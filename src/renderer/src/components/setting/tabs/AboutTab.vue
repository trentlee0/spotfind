<template>
  <v-sheet class="tw-px-5 tw-pb-5" color="transparent">
    <ShowBox :title="name">
      <p>Version: {{ version }}</p>
      <p>Author: {{ author }}</p>
      <p class="tw-flex tw-items-center">
        Link:&nbsp;
        <a
          class="tw-cursor-pointer tw-text-blue-500"
          @click="openExternal(homepage)"
          v-text="homepage"
        >
        </a>
      </p>
      <p class="tw-flex tw-items-center">
        Help:&nbsp;
        <v-icon @click="openExternal(homepage + '#Help')" size="small">
          {{ mdiHelpCircleOutline }}
        </v-icon>
      </p>
    </ShowBox>

    <ShowBox
      title="All Shortcuts"
    >
      <div class="tw-font-bold">Search Page</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left tw-w-2/3">Action</th>
            <th class="text-left tw-w-1/3">Shortcut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shortcut in searchShortcuts" :key="shortcut.action">
            <td>{{ shortcut.action }}</td>
            <td>{{ shortcut.keyboard }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="tw-mt-5 tw-font-bold">Context Menu</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left tw-w-2/3">Action</th>
            <th class="text-left tw-w-1/3">Shortcut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shortcut in menuShortcuts" :key="shortcut.action">
            <td>{{ shortcut.action }}</td>
            <td>{{ shortcut.keyboard }}</td>
          </tr>
        </tbody>
      </v-table>
    </ShowBox>
  </v-sheet>
</template>

<script lang="ts" setup>
import ShowBox from '@/components/common/ShowBox.vue'
import { reactive } from 'vue'
const { openExternal } = window.electron
import { mdiHelpCircleOutline } from '@mdi/js'
// @ts-ignore
import { name, homepage, author, version } from '../../../../../../package.json'

const searchShortcuts = reactive([
  {
    action: 'Start Search（Auto search disabled）',
    keyboard: '⏎'
  },
  {
    action: 'Focus Search Input',
    keyboard: '⌘ F'
  },
  {
    action: 'Show Detail in List Mode',
    keyboard: '→'
  },
  {
    action: 'Select Left Kind',
    keyboard: '⇧ ⌘ ['
  },
  {
    action: 'Select Right Kind',
    keyboard: '⇧ ⌘ ]'
  },
  {
    action: 'Select Previous Item',
    keyboard: '↑'
  },
  {
    action: 'Select Next Item',
    keyboard: '↓'
  },
  {
    action: 'Select First Item',
    keyboard: '⌘ ↑'
  },
  {
    action: 'Select Last Item',
    keyboard: '⌘ ↓'
  },
  {
    action: 'Select or Open Item x in the Display',
    keyboard: '⌘ 1...9'
  }
])

const menuShortcuts = reactive([
  {
    action: 'Open',
    keyboard: '⌘ O, ⏎'
  },
  {
    action: 'Reveal in Finder',
    keyboard: '⌘ ⏎'
  },
  {
    action: 'Get Info',
    keyboard: '⌘ I'
  },
  {
    action: 'Quick Look',
    keyboard: 'Space'
  },
  {
    action: 'Copy',
    keyboard: '⌘ C'
  },
  {
    action: 'Copy Name',
    keyboard: '⇧ ⌘ C'
  },
  {
    action: 'Copy Path',
    keyboard: '⌥ ⌘ C'
  },
  {
    action: 'Move to Trash',
    keyboard: '⌘ ⌫'
  }
])
</script>

<style lang="scss" scoped>
code {
  @apply tw-rounded tw-bg-gray-100 tw-p-1 dark:tw-bg-gray-800;
}
</style>
