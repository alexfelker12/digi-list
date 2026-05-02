// Protokoll: [4 Bytes Länge (Big Endian)][N Bytes JSON]

export interface TransferPayload {
  listName: string;
  items: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
    description: string | null;
    notes: string | null;
    imageUris: string[];
    altName: string | null;
    altNotes: string | null;
    sortOrder: number;
  }>;
}

export function encodePayload(payload: TransferPayload): Buffer {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

export function decodePayload(data: Buffer): TransferPayload | null {
  try {
    if (data.length < 4) return null;
    const length = data.readUInt32BE(0);
    if (data.length < 4 + length) return null;
    const json = data.slice(4, 4 + length).toString('utf8');
    return JSON.parse(json) as TransferPayload;
  } catch {
    return null;
  }
}

export const TRANSFER_PORT = 41234;
export const SERVICE_TYPE = 'digi-list';
