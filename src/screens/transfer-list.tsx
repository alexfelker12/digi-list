import { ListsListing } from "@/components/lists/lists-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { useReceiveList } from "@/hooks/use-receive-list";
import { useSendList } from "@/hooks/use-send-list";
import { allListsQueryOptions } from "@/lib/queries/list-queries";
import { ListWithItemCount } from "@/server/db";
import { useQuery } from "@tanstack/react-query";
import { Button, Separator } from "heroui-native";
import { useEffect, useState } from "react";
import { View } from "react-native";


export default function TransferListScreen() {
  const [activeTab, setActiveTab] = useState("send")

  return (
    <ScreenLayout title="Transfer" className="gap-8">
      {/* <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1"
      > */}

      {/* trigger */}
      {/* <Tabs.List>
          <Tabs.Indicator />
          <Tabs.Trigger value="send" className="flex-1">
            <Tabs.Label>Senden</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="receive" className="flex-1">
            <Tabs.Label>Empfangen</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List> */}

      {/* content */}
      {/* <Tabs.Content value="send" className="flex-1"> */}
      <SendTab />

      <Separator />
      {/* </Tabs.Content>

        <Tabs.Content value="receive" className="flex-1"> */}
      <ReceiveTab />
      {/* </Tabs.Content>

      </Tabs> */}

    </ScreenLayout>
  );
}

function SendTab() {
  const { data, isPending } = useQuery(allListsQueryOptions())
  const { status, send, cancel, selectReceiver } = useSendList()
  const [selectedList, setSelectedList] = useState<ListWithItemCount | undefined>(undefined)


  useEffect(() => {
    // return () => cancel()
  }, [])

  return (
    <View className="flex-1">
      <ListsListing
        data={data}
        isPending={isPending}
        onPress={(list) => {
          send(list.id)
          setSelectedList(list)
        }}
      />

      <Button variant="ghost" onPress={() => cancel()}>Cancel</Button>

      {status.state === "discovering" && (
        <View>
          {status.receivers.map((receiver, index) => (
            <Button key={index} variant="tertiary" onPress={() => {
              if (!selectedList) return
              selectReceiver(receiver, selectedList.name)
            }}>
              {receiver.name}
            </Button>
          ))}
        </View>
      )}

      {status.state === "waiting_confirmation" && (
        <View>
          <Text>Warten auf Bestätigung von {status.receiver.name}</Text>
        </View>
      )}

      <View>
        <Text>Status: {status.state}</Text>
        {status.state === "error" && (
          <Text>Reason: {status.reason}</Text>
        )}
      </View>
    </View>
  );
}

function ReceiveTab() {
  const { status, receive, reset, accept, reject } = useReceiveList()

  // reset on enter
  // useEffect(() => {
  //   reset()
  //   // start searching on tab switch (for now)
  //   requestAnimationFrame(
  //     () => receive()
  //   )
  // }, [])

  // reset on leave
  // useEffect(() => {
  //   // start searching on tab switch (for now)
  //   receive()
  //   return () => reset()
  // }, [])

  return (
    <View>
      <Button variant="outline" onPress={() => receive()}>Receive</Button>
      <Button variant="ghost" onPress={() => reset()}>Suchen stoppen</Button>

      {status.state === "pending" && (
        <View className="gap-4">
          <Text>{status.senderName} möchte dir die Einkaufsliste {status.listName} senden</Text>
          <View className="gap-2">
            <Button variant="secondary" onPress={() => accept()}>Bestätigen</Button>
            <Button variant="outline" onPress={() => reject()}>Ablehnen</Button>
          </View>
        </View>
      )}

      <View>
        <Text>Status: {status.state}</Text>
        {status.state === "error" && (
          <Text>Reason: {status.reason}</Text>
        )}
      </View>
    </View>
  );
}
