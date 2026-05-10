import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { ItemList } from "@/components/lists/list-item";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { queryKeys } from "@/lib/queries/_helper";
import { allListsQueryOptions, createListMutationOptions } from "@/lib/queries/list-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Separator } from "heroui-native";
import { ActivityIndicator, FlatList, View } from "react-native";


export default function ListOverviewScreen() {
  return (
    <ScreenLayout title="Einkaufslisten">
      <ListsListing />
    </ScreenLayout>
  );
}

function ListsListing() {
  const { data, isPending } = useQuery(allListsQueryOptions())

  const qc = useQueryClient();
  const { mutateAsync } = useMutation({
    ...createListMutationOptions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lists() })
  })

  const navigate = (pathname: "/list/[id]/run" | "/list/[id]/edit") => {
    return (id: number, listName: string) => router.push({ pathname, params: { id, listName } })
  }
  const navigateToRun = navigate("/list/[id]/run")
  const navigateToEdit = navigate("/list/[id]/edit")

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg">
          {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Eintrag" : "Einträge"}
        </Text>

        <ListFormDialog
          onSubmit={async (values) => {
            await mutateAsync(values, {
              // navigate to list details
              onSuccess: (data) => {
                navigateToEdit(data.id, data.name)
              },
            })
          }}
        />
      </View>

      <Separator />

      <View className="flex-1 -mx-1">
        <FlatList
          data={data}
          keyExtractor={(list) => String(list.id)}
          renderItem={({ item: list }) => (
            <ItemList
              list={list}
              onPressRun={() => navigateToRun(list.id, list.name)}
              onPressEdit={() => navigateToEdit(list.id, list.name)}
            />
          )}
          ListEmptyComponent={isPending ? (
            <ActivityIndicator size="large" className="text-accent" />
          ) : (
            <EmptyListIndicator message="Noch keine Einkaufslisten erstellt" />
          )}
          contentContainerClassName="gap-2 px-1 pb-20"
        />
      </View>
    </View>
  );
}
