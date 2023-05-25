<template>
  <v-sheet class="tw-p-5" color="transparent">
    <div class="tw-mx-1 tw-font-bold">Kind Filter</div>
    <FlexTable>
      <HeaderRow>
        <v-col :cols="2">Name</v-col>
        <v-spacer />
        <v-col :cols="8">Kind Filter Rule</v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-text-center">Enabled</v-col>
      </HeaderRow>

      <!-- 直接在 list 数组上改变元素顺序 -->
      <draggable
        :list="settingStore.kindFilters"
        @start="kindDrag = true"
        @end="kindDrag = false"
        ghost-class="ghost"
        :animation="200"
      >
        <transition-group :name="!kindDrag ? 'kind-list' : undefined">
          <BodyRow
            v-for="item in settingStore.kindFilters"
            :key="item.id"
            @dblclick="handleOpenKindDialog(item)"
            class="tw-border-t tw-bg-white dark:tw-border-t-neutral-700 dark:tw-bg-neutral-900"
          >
            <v-col :cols="2">
              {{ item.label }}
            </v-col>
            <v-spacer />
            <v-col :cols="8">
              <div class="tw-overflow-hidden tw-text-ellipsis">
                {{ item.value }}
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="1" class="tw-flex tw-items-center tw-justify-center">
              <div class="tw-flex tw-h-8 tw-items-center">
                <v-checkbox
                  v-model="item.enabled"
                  :disabled="item.id === KindFilterModel.ANY.id"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </div>
            </v-col>
          </BodyRow>
        </transition-group>
      </draggable>
    </FlexTable>

    <v-btn variant="text" @click="handleOpenKindDialog()">Add</v-btn>

    <div class="tw-mx-1 tw-mt-8 tw-font-bold">RegExp Filter</div>
    <FlexTable>
      <HeaderRow>
        <v-col :cols="2">Keyword</v-col>
        <v-spacer />
        <v-col :cols="8">RegExp</v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-text-center">Control</v-col>
      </HeaderRow>
      <BodyRow
        v-for="(item, index) in settingStore.keyList"
        :key="`${item.key}-${index}`"
        :active="index % 2 === 0"
      >
        <v-col :cols="2">{{ item.key }}</v-col>
        <v-spacer />
        <v-col :cols="8">
          <span class="tw-font-mono tw-text-sm">{{ item.regex }}</span>
        </v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-flex tw-justify-center">
          <v-btn
            variant="text"
            color="error"
            density="compact"
            @click="handleRemoveRegex(index)"
          >
            Remove
          </v-btn>
        </v-col>
      </BodyRow>
    </FlexTable>

    <v-btn variant="text" @click="regexDialog = true">Add</v-btn>
  </v-sheet>

  <v-dialog v-model="kindDialog" width="auto">
    <v-card width="400">
      <v-toolbar color="transparent">
        <v-btn icon @click="handleCloseKindDialog">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ updatedKind ? 'Update' : 'Add' }} Kind Filter
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="kindFormRef">
          <v-text-field
            v-model="kindForm.label"
            label="Name"
            density="compact"
            variant="outlined"
            :rules="kindRules.label"
            :autofocus="!isDisabledKind"
            :readonly="isDisabledKind"
          ></v-text-field>
          <v-textarea
            class="tw-font-mono"
            v-model.trim="kindForm.value"
            label="Kind Rule"
            density="compact"
            variant="outlined"
            :rules="kindRules.value"
            :readonly="isDisabledKind"
            placeholder="Multiple kind using `|` to split, exclude using `!`"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-show="updatedKind"
          variant="text"
          color="error"
          @click="handleRemoveKind"
          :disabled="isDisabledKind"
        >
          Remove
        </v-btn>
        <v-btn
          variant="text"
          @click="handleSaveKind"
          :disabled="isDisabledKind"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="regexDialog" width="auto">
    <v-card width="400">
      <v-toolbar color="transparent">
        <v-btn icon @click="handleCloseRegexDialog">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>Add RegExp Filter</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="regexFormRef">
          <v-text-field
            v-model="regexForm.key"
            label="Keyword"
            density="compact"
            variant="outlined"
            :rules="regexRules.key"
            autofocus
          ></v-text-field>
          <v-textarea
            class="tw-font-mono"
            v-model.trim="regexForm.regex"
            label="RegExp"
            density="compact"
            variant="outlined"
            :rules="regexRules.regex"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleAddRegex">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { mdiClose } from '@mdi/js'
import { KeyRegexItem, KindFilterModel } from '@/models'
import { useSettingStore } from '@/store'
import { isIllegalIndex, isLegalIndex } from '@/utils/collections'
import { cloneDeep } from 'lodash'
import { reactive } from 'vue'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { VForm } from 'vuetify/components'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import HeaderRow from '@/components/setting/table/HeadRow.vue'
import BodyRow from '@/components/setting/table/BodyRow.vue'
import FlexTable from '@/components/setting/table/FlexTable.vue'
import { nanoid } from 'nanoid'

const toast = useToast()
const settingStore = useSettingStore()

// ================== Kind ==================

const kindDrag = ref(false)
const kindDialog = ref(false)
const kindForm = reactive({
  label: '',
  value: ''
})
const kindRules = reactive({
  label: [(v: string) => !!v || 'Name is not blank'],
  value: [(v: string) => !!v || 'Kind rule is not blank']
})

const kindFormRef = ref<ComponentRef<typeof VForm>>(null)

function handleCloseKindDialog() {
  kindDialog.value = false
  kindFormRef.value?.reset()
}

const isDisabledKind = ref(false)
const updatedKind = ref<KindFilterModel>()

function handleRemoveKind() {
  if (confirm('Are you want to remove?')) {
    const index = settingStore.kindFilters.findLastIndex(
      (item) => item.id === updatedKind.value?.id
    )
    if (isLegalIndex(settingStore.kindFilters, index)) {
      try {
        settingStore.kindFilters.splice(index, 1)
      } catch (err) {
        toast.error(err + '')
      }
    }
    handleCloseKindDialog()
  }
}

async function handleSaveKind() {
  if (!(await kindFormRef.value?.validate())?.valid) return

  try {
    if (updatedKind.value) {
      // update
      updatedKind.value.label = kindForm.label
      updatedKind.value.value = kindForm.value
    } else {
      // add
      const kind = new KindFilterModel(
        nanoid(10),
        kindForm.label,
        kindForm.value
      )
      settingStore.kindFilters.push(kind)
    }
    handleCloseKindDialog()
  } catch (err) {
    toast.error(err + '')
  }
}

function handleOpenKindDialog(kind?: KindFilterModel) {
  if (kind) {
    kindForm.label = kind.label
    kindForm.value = kind.value

    isDisabledKind.value =
      KindFilterModel.DEFAULT_KINDS.findIndex((item) => item.id === kind.id) !==
      -1
    updatedKind.value = kind
  } else {
    isDisabledKind.value = false
    updatedKind.value = undefined
  }

  kindDialog.value = true
}

// ================== Regex ==================

const regexDialog = ref(false)
const regexForm = reactive<KeyRegexItem>({
  key: '',
  regex: ''
})
const regexRules = reactive({
  key: [(v: string) => !!v || 'Keyword is not blank'],
  regex: [(v: string) => !!v || 'RegExp is not blank']
})

const regexFormRef = ref<ComponentRef<typeof VForm>>(null)

function handleCloseRegexDialog() {
  regexDialog.value = false
  regexFormRef.value?.reset()
}

async function handleAddRegex() {
  if (!(await regexFormRef.value?.validate())?.valid) return

  try {
    const index = settingStore.keyList.findIndex(
      (item) => item.key === regexForm.key
    )
    if (index !== -1) {
      if (!confirm('Current keyword exist, whether cover it?')) return
      settingStore.keyList[index].regex = regexForm.regex
    } else {
      settingStore.keyList.push(cloneDeep(regexForm))
    }
    handleCloseRegexDialog()
  } catch (err) {
    toast.error(err + '')
  }
}

function handleRemoveRegex(index: number) {
  try {
    if (isIllegalIndex(settingStore.keyList, index)) return
    settingStore.keyList.splice(index, 1)
  } catch (e) {
    toast.error(e + '')
  }
}
</script>

<style lang="scss" scoped>
.ghost {
  @apply tw-bg-neutral-100 dark:tw-bg-neutral-800;
}

.kind-list-move {
  transition: transform 0.5s;
}
</style>
