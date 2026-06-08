import { Icon } from "@/components/icon";
import { ListsListing } from "@/components/lists/lists-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { ReceiveListSheet } from "@/components/transfer/receive-list-sheet";
import { SendListSheet } from "@/components/transfer/send-list-sheet";
import { allListsQueryOptions } from "@/lib/queries/list-queries";
import { ListWithItemCount } from "@/server/db";
import { useQuery } from "@tanstack/react-query";
import { Button } from "heroui-native/button";
import { Separator } from "heroui-native/separator";
import { DownloadIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";


export default function TransferListScreen() {
  const { data, isPending } = useQuery(allListsQueryOptions())
  const [selectedList, setSelectedList] = useState<ListWithItemCount | undefined>(undefined)
  const [sendOpen, setSendOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  return (
    <ScreenLayout title="Transfer">

      <View className="gap-1">
        <Text className="text-lg" numberOfLines={1}>Senden</Text>
        <Text className="text-sm text-muted">
          Klicke auf eine Liste, um diese an Handys im selben WLAN-Netzwerk zu versenden
        </Text>
      </View>

      <Separator />

      {/* send list */}
      <ListsListing
        data={data}
        isPending={isPending}
        onPress={(list) => {
          setSelectedList(list)
          setSendOpen(true)
        }}
      />
      <SendListSheet isOpen={sendOpen} onOpenChange={setSendOpen} list={selectedList} />

      <Separator />

      {/* receive list */}
      <Button variant="tertiary" className="h-10" onPress={() => setReceiveOpen(true)}>
        <Icon icon={DownloadIcon} />
        <Button.Label>Empfangen</Button.Label>
      </Button>
      <ReceiveListSheet isOpen={receiveOpen} onOpenChange={setReceiveOpen} />

    </ScreenLayout>
  );
}
