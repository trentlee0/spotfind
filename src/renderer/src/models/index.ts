import { FilePreviewType } from '@/constant'
import { SimpleFileInfo } from '~/common/models'
export * from './KindFilterModel'
export * from './SearchScopeModel'
export * from './SettingModel'

// ========================= Raw File Metadata =========================

export interface ExtraFileMetadata {
  contentCreationDate?: Date
  contentModificationDate?: Date
  contentType?: string
  contentTypeTree?: string[]
  fsName?: string
  fsNodeCount?: number
  fsSize?: number
  kind?: string
  lastUsedDate?: Date
  pixelHeight?: number
  pixelWidth?: number
  userTags?: string[]
}

// ========================= File Info =========================

export interface BaseFileInfo {
  name: string
  nameHighlight?: string
  path: string
  icon?: string
  size: number | null
  type: string
  kind: string
  createDate: string
  updateDate: string | null
  usedDate: string | null
}

export interface PreviewFileInfo extends BaseFileInfo {
  thumbnail?: string
  typeTree: string[]
  previewType: FilePreviewType
  itemCount?: number
  pixelWidth?: number
  pixelHeight?: number
  fileText?: string
  readTextSize?: number
  textEncoding?: string
  files?: Array<SimpleFileInfo>
}
