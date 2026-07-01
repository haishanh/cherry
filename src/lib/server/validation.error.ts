import { json } from '@sveltejs/kit';

type ValidationErrorItem = { field: string; message: string };

export class ValidationErrorBuilder {
  private errors: ValidationErrorItem[] = [];

  add(field: string, message: string) {
    this.errors.push({ field, message });
    return this;
  }

  response() {
    const errors = this.errors;
    return json({ errors }, { status: 400 });
  }
}
