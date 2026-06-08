import { ItemForm } from "@/components/items/item-form";
import { ProductsListing } from "@/components/items/product-listing";
import { SearchItemField } from "@/components/items/search-item-field";
import { ScreenLayout } from "@/components/screen-layout";
import { useSearchItemState } from "@/hooks/use-search-item";
import { useSelectItem } from "@/hooks/use-select-item";
import { parseItem } from "@/lib/queries/_helper";
import { allItemsQueryOptions, createItemMutationOptions } from "@/lib/queries/item-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs } from "heroui-native/tabs";
import { useState } from "react";


export default function AddListItemScreen() {
  const [activeTab, setActiveTab] = useState("existing")

  const handleSelect = useSelectItem()
  const { data, isPending } = useQuery(allItemsQueryOptions())
  const { filtered, search, setSearch } = useSearchItemState(data)

  const { onSuccess, ...mutationOptions } = createItemMutationOptions()
  const { mutateAsync } = useMutation({
    ...mutationOptions,
    onSuccess: (...args) => {
      const newItem = args[0]
      onSuccess?.(...args) // since create item has a general onSuccess call it here to not override
      handleSelect(parseItem(newItem))
    },
  })

  return (
    <ScreenLayout title="Produkt hinzufügen" showBack>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 pb-2"
      >
        <Tabs.List>
          <Tabs.Indicator />
          <Tabs.Trigger value="existing" className="flex-1">
            <Tabs.Label>Alle Produkte</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="new" className="flex-1">
            <Tabs.Label>Neues Produkt</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="existing" className="flex-1 gap-3">
          <SearchItemField
            search={search}
            setSearch={setSearch}
            className="mt-1"
          />
          <ProductsListing
            data={filtered}
            searchValue={search}
            isPending={isPending}
            onPress={(item) => handleSelect(item)}
          />
        </Tabs.Content>

        <Tabs.Content value="new" className="flex-1">
          <ItemForm
            onSubmit={async (values) => {
              await mutateAsync(values)
            }}
          />
        </Tabs.Content>

      </Tabs>

    </ScreenLayout>
  );
}
