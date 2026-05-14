import { ItemWithUriArray } from "@/server/db";
import { createContext, use } from 'react';

//* ------------------ Context ------------------
interface ItemSelectContextValue {
  handleSelect: (item: ItemWithUriArray) => void
}
const ItemSelectContext = createContext<ItemSelectContextValue | undefined>(undefined)

function useItemSelect() {
  const ctx = use(ItemSelectContext)
  if (!ctx) throw new Error("useItemSelect must be used within ItemSelectProvider")
  return ctx
}

//* ------------------ Provider ------------------
function ItemSelectProvider(props: React.ComponentProps<typeof ItemSelectContext.Provider>) {
  return <ItemSelectContext.Provider {...props} />
}

//* ------------------ Exports ------------------
export {
  ItemSelectProvider, useItemSelect, type ItemSelectContextValue
};
