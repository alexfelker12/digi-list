// protocol: [4 bytes length (big endian)][N bytes JSON]
// handshake: HELLO\n{senderName, listName}\n → ACCEPT\n | REJECT\n → payload

import { List, ListItemWithItem } from "@/server/db";
import { Buffer } from "buffer";
import * as Device from "expo-device";

export interface TransferPayload extends List {
  listItems: ListItemWithItem[]
}

export interface HelloMessage {
  senderName: string
  listName: string
}

// unique per device, used as mdns service name
export function getServiceName(): string {
  return Device.deviceName ?? "unknown-device"
}

export function encodePayload(payload: TransferPayload): Buffer {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

export function decodePayload(data: Buffer): TransferPayload | null {
  try {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
    if (buf.length < 4) return null;
    const length = buf.readUInt32BE(0);
    console.log("[decode] buf.length:", buf.length, "header length:", length)
    if (buf.length < 4 + length) return null;
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset + 4, length)
    const json = new TextDecoder("utf-8").decode(bytes)
    return JSON.parse(json) as TransferPayload;
  } catch (e) {
    console.log("[decode] error:", e)
    return null;
  }
}

export const HANDSHAKE_HELLO = "HELLO"
export const HANDSHAKE_ACCEPT = "ACCEPT"
export const HANDSHAKE_REJECT = "REJECT"

export const TRANSFER_PORT = 41234;
export const SERVICE_TYPE = "http";

// used to filter out unrelated mdns services
export const SERVICE_IDENTIFIER = "digi-list-transfer"
// txt record to identify our app's services
export const SERVICE_TXT = { app: SERVICE_IDENTIFIER }