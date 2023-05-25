import { defineStore, createPinia, Store } from 'pinia'
import persistencePiniaPlugin from 'pinia-persistence'
import { StoreKey } from '@/constant'
import { DisplayModeEnum } from '@/constant'
import { toRaw } from 'vue'
import { isIllegalIndex } from '@/utils/collections'
import { KindFilterModel, SearchScopeModel, SettingModel } from '@/models'

const storage = window.preload.db

export const useCommonStore = defineStore('common', {
  state: () => ({
    isPreviewContent: storage.getOrDefault(StoreKey.IS_PREVIEW_CONTENT, true),
    displayMode: storage.getOrDefault(
      StoreKey.DISPLAY_MODE,
      DisplayModeEnum.PREVIEW
    ),
    defaultSearchScopes: SearchScopeModel.defaultSearchScopes()
  }),
  actions: {
    setIsPreviewContent(isPreview: boolean) {
      storage.set(StoreKey.IS_PREVIEW_CONTENT, isPreview)
      this.isPreviewContent = isPreview
    },
    setDisplayMode(displayMode: DisplayModeEnum) {
      storage.set(StoreKey.DISPLAY_MODE, displayMode)
      this.displayMode = displayMode
    },
    refreshDefaultSearchScopes() {
      this.defaultSearchScopes = SearchScopeModel.defaultSearchScopes(true)
    }
  }
})

export const useSettingStore = defineStore(StoreKey.SETTING, {
  state: (): SettingModel => ({ ...new SettingModel() }),
  persist: {
    enable: true,
    map: toRaw,
    restored(store: Store) {
      const setting = toRaw(store.$state as SettingModel)
      if (SettingModel.migrateDatabase(setting)) {
        store.$patch(setting)
        store.$persist()
        console.log('database migrated:', setting)
      }
    },
    persisted(store: Store) {
      if (import.meta.env.DEV) {
        console.log('persisted', store.$id, toRaw(store.$state))
      }
    }
  },
  getters: {
    allSearchScopes(): Array<SearchScopeModel> {
      const commonStore = useCommonStore()
      return [...commonStore.defaultSearchScopes, ...this.searchScopes]
    },
    enabledKindFilters(): Array<KindFilterModel> {
      return this.kindFilters.filter((kind) => kind.enabled)
    }
  },
  actions: {
    removeSearchScope(indexInAll: number) {
      const index = indexInAll - 2
      if (isIllegalIndex(this.searchScopes, index)) return
      this.searchScopes.splice(index, 1)
    },
    getOrFallbackSearchScope(searchScopeId: string) {
      const scope = this.allSearchScopes.find((s) => s.id === searchScopeId)
      if (scope) return scope

      this.searchRoot = SearchScopeModel.USER_ID
      return SearchScopeModel.USER
    }
  }
})

const pinia = createPinia()
pinia.use(persistencePiniaPlugin)
export default pinia
