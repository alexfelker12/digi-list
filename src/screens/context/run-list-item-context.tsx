import { ListItemWithItem } from "@/server/db";
import { createContext, use } from 'react';

//* ------------------ Context ------------------
interface RunListItemContextValue {
  listItem: ListItemWithItem
  purchaseAmount: string
}
const RunListItemContext = createContext<RunListItemContextValue | undefined>(undefined)

function useRunListItem() {
  const ctx = use(RunListItemContext)
  if (!ctx) throw new Error("useRunListItem must be used within RunListItemProvider")
  return ctx
}

//* ------------------ Provider ------------------
function RunListItemProvider(props: React.ComponentProps<typeof RunListItemContext.Provider>) {
  return <RunListItemContext.Provider {...props} />
}

//* ------------------ Exports ------------------
export {
  RunListItemProvider, useRunListItem, type RunListItemContextValue
};
