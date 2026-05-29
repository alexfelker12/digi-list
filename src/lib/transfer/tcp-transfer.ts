// Protokoll: [4 Bytes Länge (Big Endian)][N Bytes JSON]

import { List, ListItemWithItem } from "@/server/db";
import { Buffer } from "buffer";

export interface TransferPayload extends List {
  listItems: ListItemWithItem[]
}

export function encodePayload(payload: TransferPayload): Buffer {
  const json = JSON.stringify(payload)
  const body = Buffer.from(json, "utf8")
  const header = Buffer.alloc(4)
  header.writeUInt32BE(body.length, 0)
  return Buffer.concat([header, body])
}

export function decodePayload(data: Buffer): TransferPayload | null {
  try {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
    if (buf.length < 4) return null
    const length = buf.readUInt32BE(0)
    if (buf.length < 4 + length) return null
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset + 4, length)
    const json = new TextDecoder("utf-8").decode(bytes)
    return JSON.parse(json) as TransferPayload
  } catch (e) {
    console.log("[decode] error:", e)
    return null
  }
}

export const TRANSFER_PORT = 41234
export const SERVICE_TYPE = "http"
export const SERVICE_NAME = "digi-list-transfer"
