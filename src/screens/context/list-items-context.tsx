import { createContext, use } from 'react';

//* ------------------ Context ------------------
interface ListItemsContextValue {
  listId: number
  listName: string
}
const ListItemsContext = createContext<ListItemsContextValue | undefined>(undefined)

function useListItems() {
  const ctx = use(ListItemsContext)
  if (!ctx) throw new Error("useListItems must be used within ListItemsProvider")
  return ctx
}

//* ------------------ Provider ------------------
function ListItemsProvider(props: React.ComponentProps<typeof ListItemsContext.Provider>) {
  return <ListItemsContext.Provider {...props} />
}

//* ------------------ Exports ------------------
export {
  ListItemsProvider, useListItems, type ListItemsContextValue
};

