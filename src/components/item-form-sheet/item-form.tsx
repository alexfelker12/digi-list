// components/item-form.tsx
import { itemInsertSchema, type ItemFormValues } from "@/server/db/schema";
import { useForm } from "@tanstack/react-form";

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
  const form = useForm({
    defaultValues: item ?? defaultValues,
    validators: {
      onChange: itemInsertSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      // await onSubmit(value);
    },
  });

  return (
    // Felder kommen hier rein
    <></>
  );
}