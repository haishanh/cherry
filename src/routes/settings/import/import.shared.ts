export type DropzoneFiles = {
  accepted: File[];
  rejected: Array<{
    errors: Array<{ message: string }>;
  }>;
};
