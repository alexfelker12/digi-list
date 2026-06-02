// protocol:
// [4 bytes json-length][json payload]
// [4 bytes image-count]
// per image: [4 bytes filename-length][filename utf8][4 bytes image-length][image bytes]

import { List, ListItemWithItem } from "@/server/db";
import { Buffer } from "buffer";
import { deviceName } from "expo-device";
import { getImageFile } from "../utils";


export interface TransferPayload extends List {
  listItems: ListItemWithItem[]
}

export interface HelloMessage {
  senderName: string
  listName: string
}

export const HANDSHAKE_HELLO = "HELLO"
export const HANDSHAKE_ACCEPT = "ACCEPT"
export const HANDSHAKE_REJECT = "REJECT"

export const SERVICE_IDENTIFIER = "digi-list-transfer"
export const SERVICE_TXT = { app: SERVICE_IDENTIFIER }
export const TRANSFER_PORT = 41234
export const SERVICE_TYPE = "http"


export function getServiceName(): string {
  return deviceName ?? "unknown-device"
}

export async function encodePayload(payload: TransferPayload): Promise<Buffer> {
  const json = JSON.stringify(payload)
  const jsonBytes = Buffer.from(json, "utf8")
  const jsonHeader = Buffer.alloc(4)
  jsonHeader.writeUInt32BE(jsonBytes.length, 0)

  // collect unique filenames across all items
  const filenames = [
    ...new Set(
      payload.listItems
        .flatMap(({ item }) => item.imageUris ?? [])
        .filter(fileName => fileName && !fileName.startsWith("file://") && !fileName.startsWith("content://"))
    )
  ]
  console.log("[encode] images to send:", filenames.length)

  const imageCountBuf = Buffer.alloc(4)
  imageCountBuf.writeUInt32BE(filenames.length, 0)

  const imageParts: Buffer[] = []

  for (const filename of filenames) {
    const file = getImageFile(filename)
    if (!file.exists) {
      console.log("[encode] image not found, skipping:", filename)
      continue
    }

    const filenameBuf = Buffer.from(filename, "utf8")
    const imageBytes = Buffer.from(await file.bytes())

    const filenameHeader = Buffer.alloc(4)
    filenameHeader.writeUInt32BE(filenameBuf.length, 0)

    const imageHeader = Buffer.alloc(4)
    imageHeader.writeUInt32BE(imageBytes.length, 0)

    imageParts.push(filenameHeader, filenameBuf, imageHeader, imageBytes)
    console.log("[encode] packed image:", filename, imageBytes.length, "bytes")
  }

  return Buffer.concat([jsonHeader, jsonBytes, imageCountBuf, ...imageParts])
}

export function decodePayload(data: Buffer) {
  try {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
    if (buf.length < 4) return null

    // read json
    const jsonLength = buf.readUInt32BE(0)
    if (buf.length < 4 + jsonLength) return null
    const json = new TextDecoder("utf-8").decode(
      new Uint8Array(buf.buffer, buf.byteOffset + 4, jsonLength)
    )
    const payload = JSON.parse(json) as TransferPayload

    // read image count
    let offset = 4 + jsonLength
    if (buf.length < offset + 4) return { payload, images: [] }
    const imageCount = buf.readUInt32BE(offset)
    offset += 4
    console.log("[decode] expected images:", imageCount)

    const images: { filename: string; bytes: Uint8Array }[] = []

    for (let i = 0; i < imageCount; i++) {
      const filenameLength = buf.readUInt32BE(offset)
      offset += 4
      const filename = new TextDecoder("utf-8").decode(
        new Uint8Array(buf.buffer, buf.byteOffset + offset, filenameLength)
      )
      offset += filenameLength

      const imageLength = buf.readUInt32BE(offset)
      offset += 4
      const imageBytes = new Uint8Array(buf.buffer, buf.byteOffset + offset, imageLength)
      offset += imageLength

      images.push({ filename, bytes: imageBytes })
      console.log("[decode] decoded image:", filename, imageBytes.length, "bytes")
    }

    return { payload, images }
  } catch (e) {
    console.log("[decode] error:", e)
    return null
  }
}

export function resolveListName(name: string, existingNames: string[]) {
  if (!existingNames.includes(name)) return name

  // strip any existing (n) suffix to get the base name
  const base = name.replace(/\s\(\d+\)$/, "")

  const numbers = existingNames
    .map((n) => n.match(new RegExp(`^${escapeRegex(base)}\\s\\((\\d+)\\)$`))?.[1])
    .filter(Boolean)
    .map(Number)

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 2
  return `${base} (${next})`
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
