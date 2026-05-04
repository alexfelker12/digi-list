import { ImageFieldComponent } from '@/components/form/image-field';
import { NumberFieldComponent } from '@/components/form/number-field';
import { TextFieldComponent } from '@/components/form/text-field';
import { UnitFieldComponent } from '@/components/form/unit-field';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';


export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField: TextFieldComponent,
    NumberField: NumberFieldComponent,
    UnitField: UnitFieldComponent,
    ImageField: ImageFieldComponent,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
