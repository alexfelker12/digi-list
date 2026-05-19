import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { ParsedItem } from "@/lib/queries/_helper";
import { ItemWithUriArray } from "@/server/db";
import { FlashList } from "@shopify/flash-list";
import { cn } from "heroui-native";
import { ActivityIndicator, GestureResponderEvent, View } from "react-native";
import { ProductItem } from "./product-item";


type ProductsListingProps = {
  data: ParsedItem[] | undefined
  isPending?: boolean
  className?: string
  onPress?: (item: ItemWithUriArray, event: GestureResponderEvent) => void
}
export function ProductsListing({ data, isPending, className, onPress }: ProductsListingProps) {
  //* see product-item
  // TODO: use one for each listing
  // TODO: global delete dialog with hook to set confirm action?
  // https://chatgpt.com/c/6a0b8158-7ef0-83eb-92bf-b6668573e458

  return (
    <View className="flex-1 -mx-1">
      <FlashList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductItem item={item} onPress={onPress} />
        )}
        ListEmptyComponent={isPending ? (
          <ActivityIndicator size="large" className="text-accent" />
        ) : (
          <EmptyListIndicator message="Noch keine Produkte erstellt" />
        )}
        contentContainerClassName={cn("gap-2 px-1 pb-1", className)}
      />
    </View>
  );
}
