import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { getPath } from './electron'
import { join } from 'path'
import { AbstractStorage } from '~/common/models'

export class LowdbStorage extends AbstractStorage {
  #db: LowSync<object>

  constructor(filename: string) {
    super()
    const adapter = new JSONFileSync<object>(
      join(getPath('userData'), filename)
    )
    this.#db = new LowSync(adapter, {})
    this.#db.read()
    this.#db.write()
  }

  get<T>(key: string): T | null {
    return Reflect.get(this.#db.data, key) ?? null
  }

  like<T>(prefix: string): T[] {
    const res: T[] = []
    for (const key in this.#db.data) {
      if (key.startsWith(prefix)) {
        res.push(this.#db.data[key])
      }
    }
    return res
  }

  set(key: string, value: any): void {
    Reflect.set(this.#db.data, key, value)
    this.#db.write()
  }

  remove(key: string): void {
    Reflect.deleteProperty(this.#db.data, key)
    this.#db.write()
  }
}
