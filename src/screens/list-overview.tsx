import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { Icon } from "@/components/icon";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { ItemList } from "@/components/lists/list-item";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allListsQueryOptions, createListMutationOptions } from "@/lib/queries/list-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Separator } from "heroui-native";
import { CirclePlusIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";


export default function ListOverviewScreen() {
  const [isOpen, setIsOpen] = useState(false)

  const { data, isPending } = useQuery(allListsQueryOptions())
  const { mutateAsync: createList } = useMutation(createListMutationOptions())

  return (
    <ScreenLayout title="Einkaufslisten">

      <View className="flex-row items-center justify-between">
        <Text className="text-muted italic">
          {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Eintrag" : "Einträge"}
        </Text>

        <Button variant="secondary" className="h-10" onPress={() => setIsOpen(true)}>
          <Icon icon={CirclePlusIcon} />
          <Button.Label>Erstellen</Button.Label>
        </Button>

        <ListFormDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSubmit={async (values) => {
            await createList(values, {
              // navigate to list details
              onSuccess: ({ id, name: listName }) => {
                router.push({ pathname: "/list/[id]/edit", params: { id, listName } })
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
            <ItemList list={list} />
          )}
          ListEmptyComponent={isPending ? (
            <ActivityIndicator size="large" className="text-accent" />
          ) : (
            <EmptyListIndicator message="Noch keine Einkaufslisten erstellt" />
          )}
          contentContainerClassName="gap-2 px-1 pb-20"
        />
      </View>

    </ScreenLayout>
  );
}
