import { contextBridge } from 'electron'
import * as api from './api'
import * as electronAPI from './electron'
import { electronAPI as preloadElectronAPI } from '@electron-toolkit/preload'

const electron = {
  ...electronAPI,
  ...preloadElectronAPI
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electron)
    contextBridge.exposeInMainWorld('preload', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electron
  // @ts-ignore (define in dts)
  window.preload = api
}
