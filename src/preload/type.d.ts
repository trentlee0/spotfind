import { electron } from '@electron-toolkit/preload'
import { OpenDialogOptions, OpenDialogReturnValue } from 'electron'

declare global {
  interface Window {
    electron: electron & typeof import('./electron')
    preload: typeof import('./api')
  }
}
