import { useFieldContext } from '@/lib/form';
import { FieldError, Input, Label, TextField } from "heroui-native";
import { useState } from "react";


interface NumberFieldProps {
  label: string;
  placeholder?: string;
}
export function NumberFieldComponent({ label, placeholder }: NumberFieldProps) {
  const field = useFieldContext<number | null>()
  const [displayValue, setDisplayValue] = useState(field.state.value?.toString() ?? "")

  // create invalid state and error message
  const meta = field.state.meta
  const isInvalid = !meta.isValid && meta.isTouched
  const errorMessage = meta.errors[0]?.message.toString()

  return (
    <TextField isInvalid={isInvalid} className="gap-0">
      <Label className="text-sm text-muted">{label}</Label>

      <Input
        className="text-base py-2.5 dark:border dark:border-border dark:focus:border-accent"
        textAlign="right"
        placeholder={placeholder}
        keyboardType="decimal-pad"
        value={displayValue}
        onChangeText={(v) => {
          const normalized = v.replace(',', '.');

          // check float number format
          if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
            setDisplayValue(v)
            const parsed = parseFloat(normalized)
            field.handleChange(isNaN(parsed) ? null : parsed) // syncing displayValue to form state
          }
        }}
        onBlur={field.handleBlur}
      />

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
