import { useAppForm } from "@/lib/form";
import { itemInsertSchema, type ItemFormValues } from '@/server/db/schema';
import { Button } from 'heroui-native/button';
import { Separator } from "heroui-native/separator";
import { ScrollView, View } from 'react-native';


const defaultValues: ItemFormValues = {
  name: "",
  imageUris: [],
}

export interface ItemFormProps {
  item?: ItemFormValues
  onSubmit: (values: ItemFormValues) => Promise<void>
}
export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const form = useAppForm({
    defaultValues: item ?? defaultValues,
    validators: {
      onSubmit: itemInsertSchema,
      onChange: itemInsertSchema,
    },
    onSubmit: async ({ value }) => {
      //* zod validation ensures quantity and unit are valid (not null)
      await onSubmit(value as ItemFormValues);
      form.reset(item ? value : defaultValues)
    },
  })

  return (
    <View className="flex-1 gap-4">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-1 flex-col gap-4 p-0.5 pb-0.75"
      >
        <form.AppField name="name">
          {(field) => <field.TextField label="Name *" placeholder="z.B. Milch" />}
        </form.AppField>

        <form.AppField name="imageUris">
          {(field) => <field.ImageField />}
        </form.AppField>

      </ScrollView>

      <Separator />

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            onPress={form.handleSubmit}
            isDisabled={!canSubmit || isSubmitting}
          >
            <Button.Label>
              {item ? 'Änderungen speichern' : 'Produkt anlegen'}
            </Button.Label>
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}