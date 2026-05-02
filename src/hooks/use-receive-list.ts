import { decodePayload, SERVICE_TYPE, TRANSFER_PORT } from '@/lib/tcp-transfer';
import { db, items, lists, stringifyImageUris } from '@/server/db';
import { useCallback, useState } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import Zeroconf from 'react-native-zeroconf';


type ReceiveStatus =
  | { state: 'idle' }
  | { state: 'discovering' }      // mDNS sucht Host
  | { state: 'receiving' }        // Daten kommen rein
  | { state: 'saving' }           // In SQLite schreiben
  | { state: 'success'; listId: number; listName: string }
  | { state: 'error'; reason: string; retryable: boolean };

export function useReceiveList() {
  const [status, setStatus] = useState<ReceiveStatus>({ state: 'idle' });

  const receive = useCallback(() => {
    setStatus({ state: 'discovering' });
    const zeroconf = new Zeroconf();
    let chunks = Buffer.alloc(0);

    // Discovery-Timeout
    const timeout = setTimeout(() => {
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
      setStatus({ state: 'error', reason: 'Kein Host gefunden (Timeout)', retryable: true });
    }, 10_000);

    zeroconf.on('resolved', (service) => {
      if (service.name !== SERVICE_TYPE) return;
      clearTimeout(timeout);
      zeroconf.stop();
      zeroconf.removeDeviceListeners();

      const host = service.addresses[0];
      setStatus({ state: 'receiving' });

      const socket = TcpSocket.createConnection({ port: TRANSFER_PORT, host }, () => { });

      socket.on('data', (data) => {
        chunks = Buffer.concat([chunks, typeof data === 'string' ? Buffer.from(data) : data]);
      });

      socket.on('close', async () => {
        setStatus({ state: 'saving' });
        const payload = decodePayload(chunks);

        if (!payload) {
          setStatus({ state: 'error', reason: 'Daten konnten nicht gelesen werden', retryable: true });
          return;
        }

        try {
          // In Transaktion speichern
          let newListId!: number;

          await db.transaction(async (tx) => {
            const [inserted] = await tx.insert(lists)
              .values({ name: payload.listName })
              .returning();

            newListId = inserted.id;

            await tx.insert(items).values(
              payload.items.map((item, idx) => ({
                listId: newListId,
                name: item.name,
                quantity: item.quantity ?? undefined,
                unit: (item.unit as any) ?? undefined,
                description: item.description ?? undefined,
                notes: item.notes ?? undefined,
                imageUris: stringifyImageUris(item.imageUris),
                altName: item.altName ?? undefined,
                altNotes: item.altNotes ?? undefined,
                sortOrder: item.sortOrder ?? idx,
                checked: false,
              }))
            );
          });

          setStatus({ state: 'success', listId: newListId, listName: payload.listName });
        } catch (e) {
          setStatus({
            state: 'error',
            reason: e instanceof Error ? e.message : 'Fehler beim Speichern',
            retryable: false,
          });
        }
      });

      socket.on('error', (err) => {
        setStatus({ state: 'error', reason: err.message, retryable: true });
      });
    });

    zeroconf.on('error', (err) => {
      clearTimeout(timeout);
      setStatus({ state: 'error', reason: err.message, retryable: true });
    });

    zeroconf.scan(SERVICE_TYPE, 'tcp', 'local.');
  }, []);

  const reset = useCallback(() => setStatus({ state: 'idle' }), []);

  return { status, receive, reset };
}
