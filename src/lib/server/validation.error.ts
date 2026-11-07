type ValidationErrorItem = { field: string; message: string };

export class ValidationErrorBuilder {
  private errors: ValidationErrorItem[] = [];

  add(field: string, message: string) {
    this.errors.push({ field, message });
    return this;
  }

  response() {
    const errors = this.errors;
    return Response.json({ errors }, { status: 400 });
  }
}
