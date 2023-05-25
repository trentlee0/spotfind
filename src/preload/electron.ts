import {
  ipcRenderer,
  clipboard,
  shell,
  nativeImage,
  OpenDialogOptions
} from 'electron'
import { ContextCommandEnum, EventConstant } from '~/common/constant'

export async function getFileIcon(path: string) {
  return await ipcRenderer.invoke(EventConstant.GET_FILE_ICON, path)
}

export async function getThumbnail(path: string, size: number = 512) {
  return (
    await nativeImage.createThumbnailFromPath(path, {
      width: size,
      height: size
    })
  ).toDataURL()
}

export async function showOpenDialog(options: OpenDialogOptions) {
  return await ipcRenderer.invoke(EventConstant.SHOW_OPEN_DIALOG, options)
}

export function previewFile(path: string, name?: string) {
  ipcRenderer.send(EventConstant.PREVIEW_FILE, path, name)
}

export function openPath(path: string) {
  shell.openPath(path)
}

export function showItemInFolder(path: string) {
  shell.showItemInFolder(path)
}

export function openExternal(url: string) {
  shell.openExternal(url)
}

export function writeText(text: string) {
  clipboard.writeText(text)
}

export function writeImage(path: string) {
  clipboard.writeImage(nativeImage.createFromPath(path))
}

export function onWindowBlur(callback: () => void) {
  ipcRenderer.on(EventConstant.WINDOW_BLUR, callback)
}

export function startDrag(files: string | string[], base64Icon: string) {
  ipcRenderer.send(
    EventConstant.START_DRAG,
    files,
    nativeImage.createFromDataURL(base64Icon)
  )
}

export function showContextMenu() {
  ipcRenderer.send(EventConstant.SHOW_CONTEXT_MENU)
}

export function onContextMenuCommand(
  handler: (command: ContextCommandEnum) => void
) {
  ipcRenderer.on(
    EventConstant.CONTEXT_MENU_COMMAND,
    (_, command: ContextCommandEnum) => handler(command)
  )
}

export function getPath(
  name:
    | 'home'
    | 'appData'
    | 'userData'
    | 'sessionData'
    | 'temp'
    | 'exe'
    | 'module'
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
    | 'recent'
    | 'logs'
    | 'crashDumps'
): string {
  return ipcRenderer.sendSync(EventConstant.GET_PATH, name)
}

export function onPreferences(handler: () => void) {
  ipcRenderer.on(EventConstant.PREFERENCES, handler)
}
