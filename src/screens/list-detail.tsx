import { CenteredSpinner } from "@/components/centered-spinner";
import { ListItemsForm } from "@/components/list-items/list-items-form";
import { ScreenLayout } from "@/components/screen-layout";
import { listItemsQueryOptions, updateListItemsMutationOptions } from "@/lib/queries/list-item-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";


export default function ListDetailScreen() {
  const { id, listName } = useLocalSearchParams<
    "/list/[id]/edit",
    { listName: string }
  >()
  const listId = +id

  const { data, isPending } = useQuery(listItemsQueryOptions(listId))
  const { mutateAsync: updateListItems } = useMutation(updateListItemsMutationOptions(listId))

  return (
    <ScreenLayout title={listName ?? "Details"} showBack className="pb-0">
      {isPending && <CenteredSpinner />}

      {data && (
        <ListItemsForm
          listId={listId}
          list={{ listItems: data }}
          onSubmit={async (values) => {
            await updateListItems(values)
          }}
        />
      )}
    </ScreenLayout>
  );
}
