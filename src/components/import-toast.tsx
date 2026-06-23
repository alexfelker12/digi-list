import { useImportList } from "@/hooks/use-import-list";
import { router } from "expo-router";
import { Spinner } from "heroui-native/spinner";
import { useToast } from "heroui-native/toast";
import { BadgeAlertIcon, BadgeCheckIcon } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { Icon } from "./icon";


export function ImportToast() {
  const { status, reset } = useImportList()
  const { toast } = useToast()

  useEffect(() => {
    if (status.state === "idle") return

    const toastId = toast.show({
      id: "import-toast",
      variant: "default",
      label: "Einkaufsliste wird importiert",
      description: "Warte, bis die Einkaufsliste gespeichert wurde",
      icon: <View className="mt-0.5"><Spinner className="size-5" /></View>,
      duration: "persistent"
    })

    if (status.state === "error") {
      toast.show({
        id: toastId,
        variant: "danger",
        label: "Fehler beim Import",
        description: status.reason,
        icon: <View className="mt-0.5"><Icon icon={BadgeAlertIcon} size={20} className="text-danger" /></View>,
        duration: 6000
      })

      //* reset for proper state display
      reset()
    }

    if (status.state === "success") {
      toast.show({
        id: toastId,
        variant: "success",
        label: "Erfolgreich importiert",
        description: `"${status.listName}" wurde importiert`,
        actionLabel: "Zur Liste",
        onActionPress: ({ hide }) => {
          hide()
          router.push({ pathname: "/list/[id]/run", params: { id: status.listId, listName: status.listName } })
        },
        icon: <View className="mt-0.5"><Icon icon={BadgeCheckIcon} size={20} className="text-success" /></View>,
        duration: 6000
      })

      //* reset for proper state display
      reset()
    }

  }, [status.state])

  return null
}
