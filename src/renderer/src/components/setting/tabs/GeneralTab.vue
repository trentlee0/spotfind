<template>
  <v-sheet class="tw-p-5" color="transparent">
    <v-checkbox
      label="Search file content"
      v-model="settingStore.isFindFileContent"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <v-checkbox
      label="Auto start search"
      v-model="settingStore.isAutoSearch"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <v-checkbox
      label="Show all files when 'Search in This Folder'"
      v-model="settingStore.isShowFilesInTempDir"
      density="comfortable"
      hide-details
    ></v-checkbox>

    <v-checkbox
      label="Show all files when kind selected"
      v-model="settingStore.isShowFilesInKind"
      density="comfortable"
      hide-details
    ></v-checkbox>

    <Subheader title="Search Scope">
      <template #append>
        <div class="tw-my-3 tw-flex tw-items-center">
          <SelectBox
            class="tw-w-48 tw-bg-neutral-100 dark:tw-bg-neutral-800"
            v-model="settingStore.searchRoot"
            :items="settingStore.allSearchScopes"
            item-label="label"
            item-value="id"
          />
          <div
            class="tw-ml-3 tw-cursor-pointer"
            @click="directoryDialog = true"
          >
            <v-icon>{{ mdiApps }}</v-icon>
          </div>
        </div>
      </template>
    </Subheader>

    <Subheader title="File Icon">
      <template #append>
        <v-radio-group v-model="settingStore.isUseSystemFileIcon" hide-details>
          <v-radio label="Default" :value="false"></v-radio>
          <v-radio label="System" :value="true"></v-radio>
        </v-radio-group>
      </template>
    </Subheader>

    <Subheader>Search Result Highlight</Subheader>
    <v-checkbox
      label="Enabled Highlight"
      v-model="settingStore.nameHighlight.enabled"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <div
      class="tw-ml-2 tw-mt-3 tw-w-2/3"
      v-if="settingStore.nameHighlight.enabled"
    >
      <v-row no-gutters>
        <v-col>
          <v-textarea
            label="Highlight Style"
            variant="outlined"
            :model-value="settingStore.nameHighlight.style"
            @change="settingStore.nameHighlight.style = $event.target.value"
            hide-details
            rows="2"
          ></v-textarea>
        </v-col>
        <v-col class="tw-flex tw-items-center">
          <div class="tw-pl-5 tw-text-base">
            <span>Search </span>
            <span :style="settingStore.nameHighlight.style">Highlight Text</span>
            <span> Example</span>
          </div>
        </v-col>
      </v-row>
    </div>

    <Subheader>
      <template #default>
        When Keystroke <span class="tw-font-bold">⌘ 1...9</span>
      </template>
      <template #append>
        <v-radio-group v-model="settingStore.isOpenAsShortcutting" hide-details>
          <v-radio label="Only select" :value="false"></v-radio>
          <v-radio label="Select and open" :value="true"></v-radio>
        </v-radio-group>
      </template>
    </Subheader>
  </v-sheet>

  <v-dialog v-model="directoryDialog" width="auto">
    <v-card width="500">
      <v-toolbar color="transparent">
        <v-btn icon @click="directoryDialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>Search Scope List</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <FlexTable>
          <HeaderRow>
            <v-col :cols="3">Name</v-col>
            <v-spacer />
            <v-col :cols="6">Folder Path</v-col>
            <v-spacer />
            <v-col :cols="2" class="tw-text-center">Control</v-col>
          </HeaderRow>
          <BodyRow
            v-for="(dir, index) in settingStore.allSearchScopes"
            :key="dir.id"
            :active="index % 2 === 0"
          >
            <v-col :cols="3">
              <div
                class="tw-rounded-md tw-border tw-border-transparent focus-within:tw-border-neutral-400"
              >
                <input
                  class="tw-w-full tw-rounded-md tw-p-1 tw-outline-none"
                  v-model.lazy="dir.label"
                  placeholder="Input Name"
                  :disabled="!checkMutable(dir)"
                />
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="6" class="tw-overflow-hidden">
              <div
                v-for="(path, index) in dir.paths"
                :key="`${path}-${index}`"
                class="tw-w-full tw-cursor-default tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-sm"
                :title="path"
              >
                {{ path }}
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="2" class="tw-flex tw-justify-center">
              <v-btn
                v-if="checkMutable(dir)"
                variant="text"
                color="error"
                density="compact"
                @click="handleRemoveDirectory(dir, index)"
              >
                Remove
              </v-btn>
            </v-col>
          </BodyRow>
        </FlexTable>
        <v-card-actions>
          <v-btn @click="handleAddDirectory"> Add</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import Subheader from '@/components/common/Subheader.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { useSettingStore } from '@/store'
import { nanoid } from 'nanoid'
const { showOpenDialog } = window.electron
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { SearchScopeModel } from '@/models'
const { getBasename } = window.preload
import HeaderRow from '@/components/setting/table/HeadRow.vue'
import BodyRow from '@/components/setting/table/BodyRow.vue'
import FlexTable from '@/components/setting/table/FlexTable.vue'
import { mdiApps, mdiClose } from '@mdi/js'

const toast = useToast()
const settingStore = useSettingStore()

const directoryDialog = ref(false)

async function handleAddDirectory() {
  const { filePaths: paths } = await showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  })
  console.log(paths)
  if (paths && paths.length) {
    try {
      const dir = new SearchScopeModel(nanoid(10), getBasename(paths[0]), paths)
      settingStore.searchScopes.push(dir)
    } catch (e) {
      toast.error(e + '')
    }
  }
}

function checkMutable(dir: SearchScopeModel) {
  return (
    SearchScopeModel.defaultSearchScopes().findIndex(
      (item) => item.id === dir.id
    ) === -1
  )
}

function handleRemoveDirectory(dir: SearchScopeModel, index: number) {
  try {
    if (dir.id === settingStore.searchRoot) {
      toast.error('当前搜索范围已被选择，不能删除！')
    } else {
      settingStore.removeSearchScope(index)
    }
  } catch (e) {
    toast.error(e + '')
  }
}
</script>

<style lang="scss" scoped></style>
