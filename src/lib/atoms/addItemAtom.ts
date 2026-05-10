import { ItemWithUriArray } from "@/server/db";
import { atom } from 'jotai';

type ResultType = ItemWithUriArray | null
export const navCallbackAtom = atom<((result: ResultType) => void) | null>(null);
