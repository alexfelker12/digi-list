import { resetListMutationOptions } from "@/lib/queries/run-list-queries";
import { useListItems } from "@/screens/context/list-items-context";
import { useMutation } from "@tanstack/react-query";
import { ResetListDialog } from "./reset-list-dialog";


export function ResetList() {
  const { listId } = useListItems()
  const { mutateAsync, isPending } = useMutation(resetListMutationOptions(listId))

  return (
    <ResetListDialog
      onConfirm={mutateAsync}
      actionPending={isPending}
    />
  );
}
