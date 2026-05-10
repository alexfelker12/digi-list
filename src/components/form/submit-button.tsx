import { useFormContext } from "@/lib/form/form-context"
import { Button } from "heroui-native"
import { Icon } from "../icon"


type SubmitButtonProps = {
  label: string
}
export function SubmitButton({ label }: SubmitButtonProps) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(s) => [s.isPristine, s.isSubmitting]}>
      {([isPristine, isSubmitting]) => (
        <Button
          onPress={form.handleSubmit}
          isDisabled={isPristine || isSubmitting}
        >
          <Icon name="save" className="text-accent-foreground" size={20} />
          <Button.Label>{label}</Button.Label>
        </Button>
      )}
    </form.Subscribe>
  )
}
