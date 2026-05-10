import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";

import { ImageFieldComponent } from "@/components/form/image-field";
import { NumberFieldComponent } from "@/components/form/number-field";
import { SubmitButton } from "@/components/form/submit-button";
import { TextFieldComponent } from "@/components/form/text-field";
import { UnitFieldComponent } from "@/components/form/unit-field";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    ImageField: ImageFieldComponent,
    NumberField: NumberFieldComponent,
    TextField: TextFieldComponent,
    UnitField: UnitFieldComponent,
  },
  formComponents: { SubmitButton },
  fieldContext,
  formContext,
});
