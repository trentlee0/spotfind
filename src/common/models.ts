export interface PrimaryFileMetadata {
  kMDItemContentType: string
  kMDItemKind: string
  kMDItemFSName: string
  kMDItemFSSize: string | null
  kMDItemFSCreationDate: string
  kMDItemFSContentChangeDate: string
  kMDItemLastUsedDate: string | null
}

export interface FindFileMetadata extends PrimaryFileMetadata {
  kMDItemPath: string
}

export interface SimpleFileInfo {
  name: string
  isFile: boolean
}

export abstract class AbstractStorage {
  abstract get<T>(key: string): T | null

  abstract like<T>(prefix: string): T[]

  abstract set(key: string, value: any): void

  abstract remove(key: string): void

  getOrDefault<T>(key: string, defaultVal: T): T {
    return this.get<T>(key) ?? defaultVal
  }
}