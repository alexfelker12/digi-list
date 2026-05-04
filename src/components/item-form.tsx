import { useAppForm } from '@/lib/form';
import { itemInsertSchema, type ItemFormValues } from '@/server/db/schema';
import { Button } from 'heroui-native/button';
import { View } from 'react-native';

const defaultValues: ItemFormValues = {
  name: "",
  quantity: 0,
  unit: "g",
  notes: null,
  imageUris: [],
  sortOrder: 0,
};

interface ItemFormProps {
  item?: ItemFormValues;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}

export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const form = useAppForm({
    defaultValues: item ?? defaultValues,
    validators: { onChange: itemInsertSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <View>
      <form.AppField name="name">
        {(field) => <field.TextField label="Name *" placeholder="z.B. Milch" />}
      </form.AppField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <form.AppField name="quantity">
            {(field) => <field.NumberField label="Menge" placeholder="z.B. 2" />}
          </form.AppField>
        </View>
        <View className="flex-1">
          <form.AppField name="unit">
            {(field) => <field.UnitField />}
          </form.AppField>
        </View>
      </View>

      <form.AppField name="imageUris">
        {(field) => <field.ImageField />}
      </form.AppField>

      <form.AppField name="notes">
        {(field) => (
          <field.TextField label="Notizen" placeholder="Optional" multiline />
        )}
      </form.AppField>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            onPress={form.handleSubmit}
            isDisabled={!canSubmit || isSubmitting}
            className="mt-4"
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