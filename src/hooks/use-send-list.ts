import { encodePayload, SERVICE_TYPE, TRANSFER_PORT, type TransferPayload } from '@/lib/tcp-transfer';
import { db, items, lists, parseImageUris } from '@/server/db';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import Zeroconf from 'react-native-zeroconf';


type SendStatus =
  | { state: 'idle' }
  | { state: 'waiting' }          // Server läuft, wartet auf Gast
  | { state: 'sending' }          // Überträgt Daten
  | { state: 'success' }
  | { state: 'error'; reason: string };

export function useSendList() {
  const [status, setStatus] = useState<SendStatus>({ state: 'idle' });

  const send = useCallback(async (listId: number) => {
    setStatus({ state: 'waiting' });
    const zeroconf = new Zeroconf();

    // 1. Liste + Items aus DB laden
    const [list] = await db.select().from(lists).where(eq(lists.id, listId));
    if (!list) {
      setStatus({ state: 'error', reason: 'Liste nicht gefunden' });
      return;
    }

    const dbItems = await db.select().from(items)
      .where(eq(items.listId, listId))
      .orderBy(items.sortOrder);

    const payload: TransferPayload = {
      listName: list.name,
      items: dbItems.map(i => ({
        name: i.name,
        quantity: i.quantity ?? null,
        unit: i.unit ?? null,
        description: i.description ?? null,
        notes: i.notes ?? null,
        imageUris: parseImageUris(i.imageUris),
        altName: i.altName ?? null,
        altNotes: i.altNotes ?? null,
        sortOrder: i.sortOrder,
      })),
    };

    const encoded = encodePayload(payload);

    // 2. TCP-Server starten & per mDNS ankündigen
    const server = TcpSocket.createServer((socket) => {
      setStatus({ state: 'sending' });
      socket.write(encoded);
      socket.on('data', () => { }); // drain
      socket.on('close', () => {
        setStatus({ state: 'success' });
        server.close();
        zeroconf.unpublishService(SERVICE_TYPE);
      });
    });

    server.on('error', (err) => {
      setStatus({ state: 'error', reason: err.message });
      zeroconf.unpublishService(SERVICE_TYPE);
    });

    server.listen({ port: TRANSFER_PORT, host: '0.0.0.0' }, () => {
      zeroconf.publishService(SERVICE_TYPE, 'tcp', 'local.', SERVICE_TYPE, TRANSFER_PORT);
    });
  }, []);

  const cancel = useCallback(() => {
    setStatus({ state: 'idle' });
  }, []);

  return { status, send, cancel };
}
