import { ItemWithUriArray } from "@/server/db";
import { atom } from 'jotai';


type AddItemState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'selected'; item: ItemWithUriArray }
export const addItemAtom = atom<AddItemState>({ status: 'idle' })
