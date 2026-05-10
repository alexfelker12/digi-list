import { useFieldContext } from "@/lib/form/form-context";
import { unitMap, UNITS, type Unit } from '@/server/db/schema';
import { cn, FieldError, Label, Select, TextField } from "heroui-native";


interface NumberFieldProps {
  label: string;
}
export function UnitFieldComponent({ label }: NumberFieldProps) {
  const field = useFieldContext<Unit | null>();

  // create invalid state and error message
  const meta = field.state.meta
  const isInvalid = !meta.isValid && meta.isTouched
  const errorMessage = meta.errors[0]?.message.toString()

  return (
    <TextField isInvalid={isInvalid} className="gap-0.5">
      <Label className="text-sm text-muted">{label}</Label>

      <Select
        value={{
          label: field.state.value ? unitMap[field.state.value] : "Einheit",
          value: field.state.value ?? ""
        }}
        onValueChange={(value) => {
          field.handleChange(
            value && value.value !== field.state.value
              ? value.value as Unit
              : null
          )
        }}
        presentation="popover"
      >
        <Select.Trigger className="text-base py-2.5 border border-transparent dark:border-border dark:focus:border-accent">
          <Select.Value placeholder={label} />
          <Select.TriggerIndicator />
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay />
          <Select.Content presentation="popover" width="trigger" offset={4} className="p-2">
            {UNITS.map((unit) => {
              return (
                <Select.Item key={unit} label={unitMap[unit]} value={unit} className="px-1 py-2">
                  {({ isSelected }) => (
                    <>
                      <Select.ItemLabel
                        className={cn("text-foreground", isSelected && "text-accent font-medium")}
                      />
                      <Select.ItemIndicator />
                    </>
                  )}
                </Select.Item>
              );
            })}
          </Select.Content>
        </Select.Portal>
      </Select>

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
