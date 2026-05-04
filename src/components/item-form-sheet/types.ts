import { Item, Unit } from "@/server/db";

export interface ItemFormSheetProps {
  item?: Item & { imageUris: string[] }; // befüllt = Bearbeiten-Modus
}

export interface FormState {
  name: string;
  quantity: string;
  unit: Unit;
  notes: string;
  imageUris: string[];
}

export const EMPTY_FORM: FormState = { name: '', quantity: '', unit: 'g', notes: '', imageUris: [] };
