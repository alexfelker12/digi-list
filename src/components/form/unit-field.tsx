import { useFieldContext } from "@/lib/form/form-context";
import { unitMap, UNITS, type Unit } from '@/server/db/schema';
import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Label } from "heroui-native/label";
import { Select } from "heroui-native/select";
import { Separator } from "heroui-native/separator";
import { TextField } from "heroui-native/text-field";
import React, { useState } from "react";
import { Keyboard } from "react-native";
import { cn } from "tailwind-variants";


interface NumberFieldProps {
  label: string;
}
export function UnitFieldComponent({ label }: NumberFieldProps) {
  const field = useFieldContext<Unit | null>();
  const [isOpen, setIsOpen] = useState(false)

  // create invalid state and error message
  const meta = field.state.meta
  const isInvalid = !meta.isValid && meta.isTouched
  const errorMessage = meta.errors[0]?.message.toString()

  return (
    <TextField isInvalid={isInvalid} className="gap-0.5">
      <Label className="text-sm text-muted">{label}</Label>

      <Select
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (open) Keyboard.dismiss()
        }}
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
        presentation="bottom-sheet"
      >
        <Select.Trigger
          className="text-base border border-transparent dark:border-border dark:focus:border-accent"
          asChild
        >
          <Button variant="outline" size="lg">
            <Button.Label><Select.Value placeholder={label} /></Button.Label>
            <Select.TriggerIndicator />
          </Button>
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay />
          <Select.Content
            presentation="bottom-sheet"
            contentContainerClassName="pt-0"
          >
            <Select.ListLabel>Einheit</Select.ListLabel>
            {UNITS.map((unit, index) => {
              return (
                <React.Fragment key={unit}>
                  <Select.Item label={unitMap[unit]} value={unit} className="py-3">
                    {({ isSelected }) => (
                      <>
                        <Select.ItemLabel
                          className={cn("text-foreground text-base", isSelected && "text-accent font-medium")}
                        />
                        <Select.ItemIndicator />
                      </>
                    )}
                  </Select.Item>
                  {index < UNITS.length - 1 && <Separator />}
                </React.Fragment>
              );
            })}
          </Select.Content>
        </Select.Portal>
      </Select>

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
