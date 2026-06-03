import Dexie, { type EntityTable } from 'dexie'
import type { WirePath } from '@/domain/types'

class WireDb extends Dexie {
  paths!: EntityTable<WirePath, 'id'>

  constructor() {
    super('wc-aef-db')
    this.version(1).stores({
      paths: 'id, updatedAt, createdAt',
    })
  }
}

export const db = new WireDb()

export async function savePath(path: WirePath): Promise<void> {
  await db.paths.put(path)
}

export async function loadAllPaths(): Promise<WirePath[]> {
  return db.paths.orderBy('createdAt').reverse().toArray()
}

export async function deletePath(id: string): Promise<void> {
  await db.paths.delete(id)
}

export async function loadPath(id: string): Promise<WirePath | undefined> {
  return db.paths.get(id)
}
