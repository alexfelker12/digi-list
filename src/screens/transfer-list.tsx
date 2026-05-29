import { ListsListing } from "@/components/lists/lists-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { useReceiveList } from "@/hooks/use-receive-list";
import { useSendList } from "@/hooks/use-send-list";
import { allListsQueryOptions } from "@/lib/queries/list-queries";
import { useQuery } from "@tanstack/react-query";
import { Button } from "heroui-native";
import { Tabs } from "heroui-native/tabs";
import { useEffect, useState } from "react";
import { View } from "react-native";


export default function TransferListScreen() {
  const [activeTab, setActiveTab] = useState("send")

  return (
    <ScreenLayout title="Transfer">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1"
      >

        {/* trigger */}
        <Tabs.List>
          <Tabs.Indicator />
          <Tabs.Trigger value="send" className="flex-1">
            <Tabs.Label>Senden</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="receive" className="flex-1">
            <Tabs.Label>Empfangen</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        {/* content */}
        <Tabs.Content value="send" className="flex-1">
          <SendTab />
        </Tabs.Content>

        <Tabs.Content value="receive" className="flex-1">
          <ReceiveTab />
        </Tabs.Content>

      </Tabs>

    </ScreenLayout>
  );
}

function SendTab() {
  const { data, isPending } = useQuery(allListsQueryOptions())
  const { status, send, cancel } = useSendList()

  useEffect(() => {
    // return () => cancel()
  }, [])

  return (
    <>
      <ListsListing
        data={data}
        isPending={isPending}
        onPress={(list) => {
          send(list.id)
        }}
      />
      <View>
        <Text>Status: {status.state}</Text>
        {status.state === "error" && (
          <Text>Reason: {status.reason}</Text>
        )}
      </View>
    </>
  );
}

function ReceiveTab() {
  const { status, receive, reset } = useReceiveList()

  // reset on enter
  useEffect(() => {
    reset()
    // start searching on tab switch (for now)
    requestAnimationFrame(
      () => receive()
    )
  }, [])

  // reset on leave
  // useEffect(() => {
  //   // start searching on tab switch (for now)
  //   receive()
  //   return () => reset()
  // }, [])

  return (
    <View>
      <View>
        <Text>Status: {status.state}</Text>
        {status.state === "error" && (
          <Text>Reason: {status.reason}</Text>
        )}
      </View>

      <Button onPress={() => reset()}>Suchen stoppen</Button>

    </View>
  );
}
