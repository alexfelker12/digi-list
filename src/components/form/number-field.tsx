import { useKeyboardAwareHandlers } from "@/hooks/use-keyboard-aware-handlers";
import { useFieldContext } from "@/lib/form/form-context";
import { Button, FieldError, InputGroup, Label, TextField } from "heroui-native";
import { MinusIcon, PlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Icon } from "../icon";


interface NumberFieldProps {
  label: string;
  placeholder?: string;
}
export function NumberFieldComponent({ label, placeholder }: NumberFieldProps) {
  const field = useFieldContext<number | null>()
  const [displayValue, setDisplayValue] = useState(field.state.value?.toString() ?? "")
  const [isFocused, setIsFocused] = useState(false)
  const { onFocus } = useKeyboardAwareHandlers()

  // update Component internal state when not inputting into number field
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(field.state.value?.toString() ?? "")
    }
  }, [field.state.value])

  // increment/decremented values
  const getIncrementedValue = (currentValue: number) => {
    const isInteger = Number.isInteger(currentValue)
    if (!isInteger) return Math.ceil(currentValue) // next higher integer
    return currentValue + 1
  }

  const getDecrementedValue = (currentValue: number) => {
    const isInteger = Number.isInteger(currentValue)
    if (currentValue < 1) return 0 // logical min is 0
    if (!isInteger) return Math.floor(currentValue) // next lower integer
    return currentValue - 1
  }

  // create invalid state and error message
  const meta = field.state.meta
  const isInvalid = !meta.isValid && meta.isTouched
  const errorMessage = meta.errors[0]?.message.toString()

  return (
    <TextField isInvalid={isInvalid} className="gap-0.5">
      <Label className="text-sm text-muted">{label}</Label>

      <InputGroup>
        <InputGroup.Prefix className="px-2">
          <Button
            onPress={() => {
              const adjustedValue = getDecrementedValue(field.state.value ?? 0)
              field.setValue(adjustedValue)
              if (isFocused) setDisplayValue(String(adjustedValue))
            }}
            isDisabled={field.state.value === 0}
            variant="ghost"
            size="sm"
            isIconOnly
            hitSlop={4}
          >
            <Icon icon={MinusIcon} />
          </Button>
        </InputGroup.Prefix>

        <InputGroup.Input
          className="text-base dark:border dark:border-border dark:focus:border-accent"
          textAlign="center"
          placeholder={placeholder}
          keyboardType="decimal-pad"
          value={displayValue}
          onChangeText={(value) => {
            const normalized = value.replace(",", ".")
            if (normalized === "" || /^\d*\.?\d*$/.test(normalized)) { // check float number format
              setDisplayValue(value)
              const parsed = parseFloat(normalized)
              field.handleChange(isNaN(parsed) ? null : parsed) // syncing displayValue to form state
            }
          }}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus(event)
          }}
          onBlur={() => {
            setIsFocused(false)
            field.handleBlur()
          }}
        />

        <InputGroup.Suffix className="px-2">
          <Button
            onPress={() => {
              const adjustedValue = getIncrementedValue(field.state.value ?? 0)
              field.setValue(adjustedValue)
              if (isFocused) setDisplayValue(String(adjustedValue))
            }}
            variant="ghost"
            size="sm"
            isIconOnly
            hitSlop={4}
          >
            <Icon icon={PlusIcon} />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
