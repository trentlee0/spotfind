import mdfind from 'mdfind'
import { fileMetadata } from 'file-metadata'
import { createReadStream, lstatSync, readdirSync, stat } from 'fs'
import { Buffer } from 'buffer'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import { readdir } from 'fs/promises'
import path, { basename } from 'path'
import os, { UserInfo } from 'os'
import { shell } from 'electron'
import { exec } from 'child_process'
import {
  AbstractStorage,
  FindFileMetadata,
  PrimaryFileMetadata,
  SimpleFileInfo
} from '~/common/models'

let terminateFunc: (() => boolean) | null = null

function kill() {
  if (terminateFunc) {
    const res = terminateFunc()
    terminateFunc = null
    return res
  }
  return true
}

export function find(
  query: string,
  directories: string[],
  limit?: number
): Promise<Array<FindFileMetadata>> {
  kill()
  const attributes: Array<keyof PrimaryFileMetadata> = [
    'kMDItemContentType',
    'kMDItemKind',
    'kMDItemFSName',
    'kMDItemFSSize',
    'kMDItemFSCreationDate',
    'kMDItemFSContentChangeDate',
    'kMDItemLastUsedDate'
  ]
  return new Promise((resolve, reject) => {
    const res = mdfind({
      query,
      attributes,
      names: [],
      directories,
      limit
    })
    terminateFunc = res.terminate
    if (res.output) {
      const data: Array<FindFileMetadata> = []
      res.output.on('data', (chunk) => data.push(chunk))
      res.output.on('end', () => {
        // 防止已终止的 mdfind 子进程还返回数据
        if (terminateFunc) {
          resolve(data)
        }
      })
      res.output.on('error', (err) => reject(err))
    } else {
      resolve([])
    }
  })
}

export function killFind() {
  return kill()
}

export function getFileMetadata(filePath: string): any {
  return fileMetadata(filePath)
}

export function trashFile(filePath: string) {
  shell.trashItem(filePath)
}

export function readFilePartText(filePath: string): Promise<{
  text: string
  encoding: string
  partialSize: number
  size: number
}> {
  return new Promise((resolve, reject) => {
    const st = lstatSync(filePath)
    const stream = createReadStream(filePath, {
      flags: 'r',
      highWaterMark: 128 * 1000 * 1000,
      start: 0
    })
      .on('data', (data) => {
        stream.close()
        const res = data as Buffer
        const encoding = chardet.detect(res)
        if (encoding !== null) {
          resolve({
            text: iconv.decode(res, encoding),
            encoding,
            partialSize: res.byteLength,
            size: st.size
          })
        } else {
          throw new Error(
            'The encoding of the detected file is null! File: ' + filePath
          )
        }
      })
      .on('error', reject)
  })
}

export function readFileList(dirPath: string): Promise<Array<SimpleFileInfo>> {
  return new Promise((resolve) => {
    // 获取并过滤隐藏文件
    readdir(dirPath).then((files) => {
      const res = files
        .filter((item) => !item.startsWith('.'))
        .map((name) => {
          const st = lstatSync(path.join(dirPath, name))
          return {
            name,
            isFile: !st.isDirectory()
          }
        })
      resolve(res)
    })
  })
}

export function existsDir(dirPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    stat(dirPath, (err, stat) => {
      resolve(err ? false : stat.isDirectory())
    })
  })
}

export function getOsUserInfo(): UserInfo<string> {
  return os.userInfo()
}

export function getBasename(path: string): string {
  return basename(path)
}

export function getVolumes(): { name: string; path: string }[] {
  return readdirSync('/Volumes')
    .filter((item) => item !== 'Macintosh HD')
    .map((name) => ({ name, path: path.join('/Volumes', name) }))
}

export function openInfoWindow(path: string) {
  const script = `
    tell application "Finder"
        open information window of ((POSIX file "${path}") as alias)
        activate information window
    end tell`
  exec(`osascript -e '${script}'`)
}

import { LowdbStorage } from './db'
const lowdb = new LowdbStorage('db.json')
export const db: AbstractStorage = {
  get: function <T>(key: string): T | null {
    return lowdb.get(key)
  },
  like: function <T>(prefix: string): T[] {
    return lowdb.like(prefix)
  },
  set: function (key: string, value: any): void {
    return lowdb.set(key, value)
  },
  remove: function (key: string): void {
    return lowdb.remove(key)
  },
  getOrDefault: function <T>(key: string, defaultVal: T): T {
    return lowdb.getOrDefault(key, defaultVal)
  }
}
