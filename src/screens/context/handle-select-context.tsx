import { ItemWithUriArray } from "@/server/db";
import { createContext, use } from 'react';

//* ------------------ Context ------------------
interface HandleSelectContextValue {
  handleSelect: (item: ItemWithUriArray) => void
}
const HandleSelectContext = createContext<HandleSelectContextValue | undefined>(undefined)

function useHandleSelect() {
  const ctx = use(HandleSelectContext)
  if (!ctx) throw new Error("useHandleSelect must be used within HandleSelectProvider")
  return ctx
}

//* ------------------ Provider ------------------
function HandleSelectProvider(props: React.ComponentProps<typeof HandleSelectContext.Provider>) {
  return <HandleSelectContext.Provider {...props} />
}

//* ------------------ Exports ------------------
export {
  HandleSelectProvider, useHandleSelect, type HandleSelectContextValue
};

