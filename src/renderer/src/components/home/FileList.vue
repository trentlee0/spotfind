<template>
  <v-virtual-scroll
    ref="scrollRef"
    :items="items"
    :item-height="itemHeight"
    height="100%"
    class="tw-w-full"
    @scroll="handleScroll"
  >
    <template #default="{ item, index }: { item: BaseFileInfo, index: number }">
      <div
        class="tw-flex tw-w-full tw-cursor-pointer tw-select-none tw-items-center"
        @contextmenu="onContextMenu($event, index)"
        @mouseover="handleMouseEnter(index)"
        @click="handleItemClick(index)"
        @dblclick="contextActions.open"
        draggable="true"
        @dragstart="handleDragStart($event, index, item)"
      >
        <v-list-item
          width="100%"
          :height="itemHeight"
          lines="one"
          :color="selectedIndex === index ? 'blue' : ''"
          :active="selectedIndex === index"
        >
          <template #prepend>
            <v-avatar
              :fake="getIcon(item)"
              :image="item.icon"
              :size="itemHeight - 10"
              :rounded="0"
            />
          </template>
          <template #title>
            <span class="tw-font-bold">
              <span
                v-if="item.nameHighlight"
                v-html="item.nameHighlight"
              ></span>
              <span v-else>
                {{ item.name }}
              </span>
            </span>
          </template>
          <template #subtitle>
            <div
              class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
            >
              {{ item.path }}
            </div>
          </template>
          <template #append v-if="listMode">
            <div class="tw-w-7"></div>
            <div
              class="tw-font-mono tw-text-sm tw-text-neutral-500 dark:tw-text-neutral-300"
            >
              <div>{{ formatDatetime(item.updateDate ?? '') }}</div>
              <div v-show="item.size !== null" class="tw-text-right">
                {{ handleBytesToHuman(item.size ?? 0) }}
              </div>
            </div>
          </template>
        </v-list-item>
      </div>
    </template>
  </v-virtual-scroll>
</template>

<script lang="ts" setup>
import { useMouse } from '@/hooks/useMouse'
import { BaseFileInfo } from '@/models'
import { formatDatetime, handleBytesToHuman } from '@/utils/strings'
import { onKeyDown } from '@vueuse/core'
import { debounce } from 'lodash'
import { computed, ref } from 'vue'
import { VVirtualScroll } from 'vuetify/components'
import { useSettingStore } from '@/store'
const { getFileIcon } = window.electron
import { isLegalIndex } from '@/utils/collections'
import { reactive } from 'vue'
import * as icons from '@/utils/icons'
import { ContentType } from '@/constant'
import { ContextCommandEnum } from '~/common/constant'

const { isMouseMove } = useMouse()
const settingStore = useSettingStore()

const scrollRef = ref<ComponentRef<typeof VVirtualScroll>>(null)

const props = withDefaults(
  defineProps<{
    items: Array<BaseFileInfo>
    itemHeight: number
    displaySize: number
    selectedIndex?: number
    listMode?: boolean
    isKeystroke?: boolean
  }>(),
  {
    selectedIndex: 0,
    listMode: false,
    isKeystroke: true
  }
)

function getIcon(item: BaseFileInfo) {
  if (settingStore.isUseSystemFileIcon) {
    getFileIcon(item.path).then((res) => {
      item.icon = res
    })
  } else {
    item.icon = icons.getFileIcon(item.name, item.type !== ContentType.FOLDER)
  }
}

const maxIndexInWindow = computed(() => props.displaySize - 1)

const emit = defineEmits<{
  'update:selectedIndex': [index: number]
  openItem: []
  openItemInFinder: []
  showItemInfo: []
  quickLookItem: []
  copyItem: []
  copyItemName: []
  copyItemPath: []
  moveItemToTrash: []
}>()

const contextActions = reactive({
  open: () => emit('openItem'),
  openInFinder: () => emit('openItemInFinder'),
  showInfo: () => emit('showItemInfo'),
  quickLook: () => emit('quickLookItem'),
  copy: () => emit('copyItem'),
  copyName: () => emit('copyItemName'),
  copyPath: () => emit('copyItemPath'),
  moveToTrash: () => emit('moveItemToTrash')
})

window.electron.onContextMenuCommand((command) => {
  switch (command) {
    case ContextCommandEnum.OPEN:
      return emit('openItem')
    case ContextCommandEnum.OPEN_IN_FINDER:
      return emit('openItemInFinder')
    case ContextCommandEnum.SHOW_INFO:
      return emit('showItemInfo')
    case ContextCommandEnum.QUICK_LOOK:
      return emit('quickLookItem')
    case ContextCommandEnum.COPY:
      return emit('copyItem')
    case ContextCommandEnum.COPY_NAME:
      return emit('copyItemName')
    case ContextCommandEnum.COPY_PATH:
      return emit('copyItemPath')
    case ContextCommandEnum.MOVE_TO_TRASH:
      return emit('moveItemToTrash')
  }
})

function onContextMenu(e: MouseEvent, index: number) {
  e.preventDefault()

  emit('update:selectedIndex', index)
  window.electron.showContextMenu()
  // finderMenuRef.value?.showMenu(e.x, e.y)
}

function handleItemClick(index: number) {
  emit('update:selectedIndex', index)
}

function handleMouseEnter(index: number) {
  if (!props.listMode || !isMouseMove.value) return
  emit('update:selectedIndex', index)
}

async function handleDragStart(
  e: DragEvent,
  index: number,
  item: BaseFileInfo
) {
  e.preventDefault()
  emit('update:selectedIndex', index)
  if (item.icon) {
    window.electron.startDrag(item.path, item.icon)
  }
}

const firstIndexInWindow = ref(0)
const handleScroll = debounce((e: Event) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLDivElement
  firstIndexInWindow.value = Math.round(scrollTop / props.itemHeight)
  if (scrollTop + clientHeight === scrollHeight) {
    console.log('scroll end')
  }
}, 30)

function locateTo(index: number) {
  scrollRef.value?.scrollToIndex(index)
}

let posInWindow = 0

function refreshPosition(index: number) {
  if (
    firstIndexInWindow.value <= index &&
    index < firstIndexInWindow.value + props.displaySize
  ) {
    posInWindow = index - firstIndexInWindow.value
  }
}

function incrementPosition() {
  return (
    (posInWindow = Math.min(posInWindow + 1, maxIndexInWindow.value)) ===
    maxIndexInWindow.value
  )
}

function decrementPosition() {
  return (posInWindow = Math.max(posInWindow - 1, 0)) === 0
}

/**
 * 定位到窗口最顶行
 */
function locateToStart(index: number) {
  posInWindow = 0
  locateTo(index)
}

/**
 * 定位到窗口最底行
 */
function locateToEnd(index: number) {
  posInWindow = maxIndexInWindow.value
  locateTo(Math.max(index - maxIndexInWindow.value, 0))
}

/**
 * 判断已选择行在可视窗口的上方（-1）、下方（1）、还是在里面（0）
 */
function compareSelected(selectedIndex: number) {
  if (selectedIndex < firstIndexInWindow.value) return -1
  if (
    selectedIndex >
    Math.min(
      firstIndexInWindow.value + maxIndexInWindow.value,
      props.items.length - 1
    )
  )
    return 1
  return 0
}

function scrollTo(index: number) {
  if (isLegalIndex(props.items, index)) {
    emit('update:selectedIndex', index)
    locateTo(index)
  }
}

onKeyDown(['Meta', 'ArrowUp', 'ArrowDown'], (e) => {
  if (!props.isKeystroke) return

  e.preventDefault()
  if (e.metaKey && e.key === 'Meta') return

  if (e.metaKey) {
    return scrollTo(e.key === 'ArrowUp' ? 0 : props.items.length - 1)
  }

  refreshPosition(props.selectedIndex)

  let index
  if (e.key === 'ArrowUp') {
    index = Math.max(props.selectedIndex - 1, 0)
    emit('update:selectedIndex', index)

    if (decrementPosition()) {
      locateToStart(index)
    }
  } else {
    index = Math.min(props.selectedIndex + 1, props.items.length - 1)
    emit('update:selectedIndex', index)

    if (incrementPosition()) {
      locateToEnd(index)
    }
  }
  const compare = compareSelected(index)
  if (compare < 0) {
    locateToStart(index)
  } else if (compare > 0) {
    locateToEnd(index)
  }
})

defineExpose({
  locateTo,
  locateToView() {
    locateTo(firstIndexInWindow.value)
  },
  scrollToView(offset: number) {
    const index = firstIndexInWindow.value + offset
    if (isLegalIndex(props.items, index)) {
      emit('update:selectedIndex', index)
    }
  }
})
</script>

<style lang="scss" scoped>
.active {
  @apply tw-bg-blue-500 tw-text-white;
}
</style>
