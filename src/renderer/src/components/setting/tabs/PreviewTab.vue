<template>
  <v-sheet class="tw-p-5" color="transparent">
    <v-row>
      <v-col cols="3" class="tw-flex tw-items-center tw-justify-end">
        <div>Text Files</div>
      </v-col>
      <v-col cols="9">
        <v-text-field
          variant="outlined"
          density="compact"
          placeholder="File extension，using `,` to split"
          :model-value="settingStore.fileExtension"
          @change="settingStore.fileExtension = $event.target.value"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="3" class="tw-flex tw-items-center tw-justify-end">
        <div>Picture Files</div>
      </v-col>
      <v-col cols="9">
        <v-text-field
          variant="outlined"
          density="compact"
          placeholder="File extension，using `,` to split"
          :model-value="settingStore.pictureExtension"
          @change="settingStore.pictureExtension = $event.target.value"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="3" class="tw-flex tw-items-center tw-justify-end">
        <div>Audio Files</div>
      </v-col>
      <v-col cols="9">
        <v-text-field
          variant="outlined"
          density="compact"
          placeholder="File extension，using `,` to split"
          :model-value="settingStore.audioExtension"
          @change="settingStore.audioExtension = $event.target.value"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="3" class="tw-flex tw-items-center tw-justify-end">
        <div>Video Files</div>
      </v-col>
      <v-col cols="9">
        <v-text-field
          variant="outlined"
          density="compact"
          placeholder="File extension，using `,` to split"
          :model-value="settingStore.videoExtension"
          @change="settingStore.videoExtension = $event.target.value"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useSettingStore } from '@/store'

const settingStore = useSettingStore()
</script>

<style lang="scss" scoped></style>
