import { Text } from '@/components/text';
import { DiscoveredReceiver, SendStatus, useSendList } from "@/hooks/use-send-list";
import { ListWithItemCount } from "@/server/db";
import { Alert, Button, Card, PressableFeedback } from "heroui-native";
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { Spinner } from "heroui-native/spinner";
import { SmartphoneIcon, XIcon } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../icon";
import { AlertIndicator } from "./alert-indicator";


type SendListSheetProps = {
  list: ListWithItemCount | undefined
}
export function SendListSheet({ list, isOpen, onOpenChange }: SendListSheetProps & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { top } = useSafeAreaInsets()
  const { status, send, rescan, cancel, selectReceiver } = useSendList()

  // send list when sheet gets opened
  useEffect(() => {
    if (list && isOpen) {
      send(list.id)
    } else if (status.state !== "idle") {
      cancel()
    }

    return () => {
      if (status.state !== "idle" && !isOpen) cancel()
    }
  }, [list, isOpen])

  const resolveSendStatus = (state: SendStatus["state"]): {
    status: React.ComponentProps<typeof Alert>["status"]
    title: string
  } => {
    switch (state) {
      case "idle":
        return {
          status: "accent",
          title: "Senden"
        }
      case "discovering":
      case "discovered":
        return {
          status: "default",
          title: "Klicke auf ein Handy, um diesem die Einkaufsliste zu senden"
        }
      case "waiting_confirmation":
        return {
          status: "accent",
          title: `Warten auf Bestätigung von ${status.state === "waiting_confirmation" && status.receiver.name}`
        }
      case "rejected":
        return {
          status: "warning",
          title: "Einkaufsliste wurde abgelehnt"
        }
      case "sending":
        return {
          status: "accent",
          title: "Wird versendet..."
        }
      case "success":
        return {
          status: "success",
          title: "Erfolgreich versendet"
        }
      case "error":
        return {
          status: "danger",
          title: "Etwas ist schiefgelaufen"
        }
    }
  }

  const alertStatus = resolveSendStatus(status.state)
  const isProcessing = status.state === "waiting_confirmation" || status.state === "sending"
  const isDiscovering = status.state === "discovering"
  const isDiscovered = status.state === "discovered"

  return (
    <View className="absolute top-0 right-0">
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            contentContainerClassName="p-4 pt-0 pb-safe-offset-2 gap-4"
            enableDynamicSizing
            topInset={top}
          >
            {/* title */}
            <View className="flex-row gap-2 justify-between items-center">
              <BottomSheet.Title>{list?.name} senden</BottomSheet.Title>
              {isDiscovering &&
                <SpinnerWithText text="Suche Handys" />
              }
              {isDiscovered &&
                <Button onPress={() => rescan()} variant="tertiary" size="sm" className="h-7 px-2.5">
                  <Button.Label className="text-xs">Erneut scannen</Button.Label>
                </Button>
              }
            </View>

            {(isDiscovering || isDiscovered) && (
              <View className="bg-transparent border border-border border-dashed p-3 rounded-3xl">
                <ResolvedReceivers
                  data={status.receivers}
                  onPress={(receiver) => {
                    if (!list) return
                    selectReceiver(receiver, list.name)
                  }}
                  isDiscovering={isDiscovering}
                />
              </View>
            )}

            <Alert status={alertStatus.status} className="bg-transparent border border-border border-dashed">
              <AlertIndicator isProcessing={isProcessing} />
              <Alert.Content>
                <Alert.Title>{alertStatus.title}</Alert.Title>

                {status.state === "error" && (
                  <Alert.Description>{status.reason}</Alert.Description>
                )}
              </Alert.Content>
            </Alert>

            {/* close/abort button */}
            <Button variant="outline" className="h-10" onPress={() => onOpenChange(false)}>
              <Icon icon={XIcon} />
              <Button.Label>
                {status.state === "idle" || status.state === "success" || status.state === "error" ? "Schließen" : "Abbrechen"}
              </Button.Label>
            </Button>

          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}

type ResolvedReceiversProps = {
  data: DiscoveredReceiver[]
  onPress: (selectedReceiver: DiscoveredReceiver) => void
  isDiscovering?: boolean
}
function ResolvedReceivers({ data, onPress, isDiscovering }: ResolvedReceiversProps) {
  // flatlist
  const renderItem = useCallback<ListRenderItem<DiscoveredReceiver>>(
    ({ item: receiver }) => <ResolvedReceiver
      onPress={() => onPress(receiver)}
      {...receiver}
    />,
    []
  )
  const keyExtractor = useCallback(
    (item: DiscoveredReceiver) => String(item.host),
    []
  )

  return (
    <View className="flex-1 -m-1">
      <FlatList data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        ListEmptyComponent={
          <View className="w-full p-4 items-center justify-center">
            <Text>
              {isDiscovering ? "Suche Handys..." : "Keine Handys gefunden"}
            </Text>
          </View>
        }
        contentContainerClassName="gap-2 p-1"
      />
    </View>
  );
}

function ResolvedReceiver({
  name,
  host,
  port,
  ...props
}: DiscoveredReceiver & React.ComponentProps<typeof PressableFeedback>) {
  return (
    <PressableFeedback className="overflow-auto" {...props}>
      <Card className="flex-row justify-between items-center rounded-2xl p-3 bg-surface-secondary">
        <PressableFeedback.Highlight />

        <Card.Body className="flex-row items-center justify-start gap-2">
          <Icon icon={SmartphoneIcon} />
          <Card.Title className="leading-tight text-base font-semibold">{name}</Card.Title>
        </Card.Body>
      </Card>
    </PressableFeedback>
  );
}

function SpinnerWithText({ text }: { text: string }) {
  return (
    <Button variant="outline" size="sm" className="h-7 px-2.5" isDisabled>
      <Spinner size="sm" />
      <Button.Label className="text-xs">{text}</Button.Label>
    </Button>
  );
}
