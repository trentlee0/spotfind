import { getFileExtension } from './strings'

export function copyFromPath(path: string, picExts?: string) {
  const ext = getFileExtension(path)
  if (picExts?.includes(ext)) {
    window.electron.writeImage(path)
  } else {
    window.electron.writeText(path)
  }
}
