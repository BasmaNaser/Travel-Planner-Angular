import { AbstractControl, FormGroup } from '@angular/forms';

export interface BackendFieldError {
  field?: string;
  message?: string;
}

export function apiMessage(
  error: any,
  fallback = 'Something went wrong. Please try again.'
): string {
  return error?.error?.message || error?.message || fallback;
}

export function applyBackendErrors(
  form: FormGroup,
  error: any
): string {
  const errors: BackendFieldError[] =
    error?.error?.errors ?? [];

  let mapped = false;

  for (const item of errors) {
    if (!item?.field || !item?.message) {
      continue;
    }

    const control: AbstractControl | null =
      form.get(item.field);

    if (!control) {
      continue;
    }

    mapped = true;

    control.setErrors({
      ...(control.errors ?? {}),
      backend: item.message
    });

    control.markAsTouched();
  }

  // لو الـ backend رجع error خاص بحقل معين،
  // هيظهر تحت الحقل نفسه بدل ما نكرره فوق الفورم.
  return mapped ? '' : apiMessage(error);
}