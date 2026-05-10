import { ListItemsForm } from "@/components/list-items/list-items-form";
import { ScreenLayout } from "@/components/screen-layout";
import { queryKeys } from "@/lib/queries/_helper";
import { listItemsQueryOptions, updateListItemsMutationOptions } from "@/lib/queries/list-item-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";


export default function ListDetailScreen() {
  const { id, listName } = useLocalSearchParams<
    "/list/[id]/edit",
    { listName: string }
  >()
  const listId = +id

  const { data, isPending } = useQuery(listItemsQueryOptions(listId))

  const qc = useQueryClient();
  const { mutateAsync } = useMutation({
    ...updateListItemsMutationOptions(listId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.listItems(listId) })
  })

  return (
    <ScreenLayout title={listName ?? "Details"} showBack className="pb-0">
      {isPending && <ActivityIndicator size="large" className="text-accent" />}

      {data && (
        <ListItemsForm
          listId={listId}
          list={{ listItems: data }}
          onSubmit={async (values) => {
            await mutateAsync(values)
          }}
        />
      )}
    </ScreenLayout>
  );
}
