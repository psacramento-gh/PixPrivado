export function isReceitaCepField(fieldPath: string): boolean {
  const lastSegment = fieldPath.split(".").pop()?.replace(/\[\d+\]$/, "") ?? fieldPath;
  return lastSegment === "cep";
}
