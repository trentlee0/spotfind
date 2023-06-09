<template>
  <div
    class="tw-select-none tw-overflow-hidden tw-rounded-md"
    :class="{ 'diff-line': isDiffStyle }"
  >
    <div
      class="tw-flex tw-h-8 tw-items-center tw-px-3"
      :class="{ active: active }"
    >
      <div class="tw-mr-2" v-if="file">
        <v-avatar
          :image="icon"
          size="22"
          :rounded="0"
          :fake="getIcon(file.name, file.isFile)"
        />
      </div>
      <div
        class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-base tw-font-bold"
      >
        {{ file?.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSettingStore } from '@/store'
import * as icons from '@/utils/icons'
import { ref } from 'vue'
import { SimpleFileInfo } from '~/common/models'
const { getFileIcon } = window.electron

const icon = ref<string>()
const settingStore = useSettingStore()
const props = defineProps<{
  file?: SimpleFileInfo
  dirPath?: string
  active?: boolean
  isDiffStyle?: boolean
}>()

function getFullPath(filename: string) {
  if (!props.dirPath) return ''
  return `${props.dirPath}/${filename}`
}

async function getIcon(filename: string, isFile: boolean) {
  if (settingStore.isUseSystemFileIcon) {
    icon.value = await getFileIcon(getFullPath(filename))
    return
  }
  icon.value = icons.getFileIcon(getFullPath(filename), isFile)
}
</script>

<style lang="scss" scoped>
.active {
  @apply tw-bg-blue-600 tw-text-white;
}

.diff-line {
  @apply tw-bg-neutral-100 dark:tw-bg-neutral-800;
}
</style>
