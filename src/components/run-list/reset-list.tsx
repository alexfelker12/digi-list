import { queryKeys } from "@/lib/queries/_helper";
import { resetListMutationOptions } from "@/lib/queries/run-list-queries";
import { useListItems } from "@/screens/context/list-items-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResetListDialog } from "./reset-list-dialog";


export function ResetList() {
  const { listId } = useListItems()
  const qc = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    ...resetListMutationOptions(listId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.checkedCount(listId) })
      qc.invalidateQueries({ queryKey: queryKeys.listItems(listId) })
    },
  })

  return (
    <ResetListDialog
      onConfirm={mutateAsync}
      actionPending={isPending}
    />
  );
}
