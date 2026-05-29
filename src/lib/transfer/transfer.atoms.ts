import { atom } from 'jotai';
import { DiscoveredDevice } from "./TcpTransferService";
import { TransferConflict, TransferConflictResponse } from './types';

export type TransferStatus =
  | 'idle'
  | 'discovering'
  | 'connecting'
  | 'transferring'
  | 'awaiting_conflicts'
  | 'success'
  | 'error';

export type ReceiverStatus =
  | 'idle'
  | 'listening'
  | 'receiving'
  | 'awaiting_conflicts'
  | 'success'
  | 'error';

// Sender
export const senderStatusAtom = atom<TransferStatus>('idle');
export const discoveredDevicesAtom = atom<DiscoveredDevice[]>([]);
export const senderProgressAtom = atom<{ sent: number; total: number }>({ sent: 0, total: 0 });
export const senderErrorAtom = atom<string | null>(null);

// Empfänger
export const receiverStatusAtom = atom<ReceiverStatus>('idle');
export const receiverProgressAtom = atom<{ received: number; total: number }>({ received: 0, total: 0 });
export const receiverErrorAtom = atom<string | null>(null);

// Konflikt-Dialog (geteilt für Sender + Empfänger)
export const pendingConflictsAtom = atom<TransferConflict[]>([]);
export const conflictResolverAtom = atom<((r: TransferConflictResponse) => void) | null>(null);
