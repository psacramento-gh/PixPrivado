const BIRTH_FIELD_NAMES = new Set([
  "dob",
  "date_of_birth",
  "birth_date",
  "birthday",
]);

export function isBirthField(fieldName: string): boolean {
  return BIRTH_FIELD_NAMES.has(fieldName.toLowerCase());
}
