import { ReceiveStatus, useReceiveList } from "@/hooks/use-receive-list";
import { router } from "expo-router";
import { Alert } from "heroui-native/alert";
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { Button } from "heroui-native/button";
import { XIcon } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../icon";
import { AlertIndicator } from "./alert-indicator";


type ReceiveListSheetProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}
export function ReceiveListSheet({ isOpen, onOpenChange }: ReceiveListSheetProps) {
  const { top } = useSafeAreaInsets()
  const { status, receive, reset, accept, reject } = useReceiveList()

  // advertise when sheet is open
  useEffect(() => {
    if (isOpen) {
      receive()
    } else if (status.state !== "idle") {
      reset()
    }

    return () => {
      if (status.state !== "idle" && !isOpen) reset()
    }
  }, [isOpen])

  const handleRetry = () => {
    reset()
    requestAnimationFrame(() => receive())
  }

  const handleGoToList = () => {
    if (status.state !== "success") return
    onOpenChange(false)
    requestAnimationFrame(() => router.push({
      pathname: "/list/[id]/edit",
      params: { id: status.listId }
    }))
  }

  const resolveReceiveStatus = (state: ReceiveStatus["state"]): {
    status: React.ComponentProps<typeof Alert>["status"]
    title: string
  } => {
    switch (state) {
      case "idle":
        return {
          status: "accent",
          title: "Empfangen"
        }
      case "advertising":
        return {
          status: "accent",
          title: "Warte auf Listeneingang..."
        }
      case "pending":
        return {
          status: "default",
          title: "Einkaufsliste Eingehend"
        }
      case "receiving":
        return {
          status: "accent",
          title: "Wird empfangen..."
        }
      case "saving":
        return {
          status: "accent",
          title: "Wird gespeichert..."
        }
      case "success":
        return {
          status: "success",
          title: "Erfolgreich gespeichert"
        }
      case "error":
        return {
          status: "danger",
          title: "Etwas ist schiefgelaufen"
        }
    }
  }

  const alertStatus = resolveReceiveStatus(status.state)
  const isProcessing = status.state === "advertising" || status.state === "receiving" || status.state === "saving"

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
            <BottomSheet.Title>Einkaufsliste empfangen</BottomSheet.Title>

            <Alert status={alertStatus.status} className="bg-transparent border border-border border-dashed">
              <AlertIndicator isProcessing={isProcessing} />
              <Alert.Content>
                <Alert.Title>{alertStatus.title}</Alert.Title>

                {status.state === "pending" && (
                  <>
                    <Alert.Description>
                      {status.senderName} möchte dir die Einkaufsliste '{status.listName}' senden
                    </Alert.Description>
                    <View className="gap-2 mt-3">
                      <Button variant="secondary" onPress={() => accept()}>Bestätigen</Button>
                      <Button variant="outline" onPress={() => reject()}>Ablehnen</Button>
                    </View>
                  </>
                )}
                {status.state === "success" && (
                  <>
                    <Alert.Description>
                      Du kannst die Einkaufsliste nun bearbeiten
                    </Alert.Description>
                    <View className="gap-2 mt-3">
                      <Button variant="tertiary" onPress={handleGoToList}>
                        Zur Einkaufsliste
                      </Button>
                    </View>
                  </>
                )}
                {status.state === "error" && (
                  <>
                    <Alert.Description>
                      {status.reason}
                    </Alert.Description>
                    {status.retryable && (
                      <View className="gap-2 mt-3">
                        <Button variant="outline" onPress={handleRetry}>Erneut versuchen</Button>
                      </View>
                    )}
                  </>
                )}
              </Alert.Content>
            </Alert>

            {/* close/abort button */}
            <Button variant="outline" className="h-10" onPress={() => onOpenChange(false)}>
              <Icon icon={XIcon} />
              <Button.Label>
                {
                  status.state === "idle" || status.state === "success" || (status.state === "error" && !status.retryable)
                    ? "Schließen"
                    : "Abbrechen"
                }
              </Button.Label>
            </Button>

          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}
