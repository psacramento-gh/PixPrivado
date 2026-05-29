/** True for OpenCNPJ phone area-code fields (`telefones[n].ddd`). */
export function isReceitaDddField(fieldPath: string): boolean {
  if (!fieldPath.startsWith("telefones")) return false;
  const lastSegment = fieldPath.split(".").pop()?.replace(/\[\d+\]$/, "") ?? fieldPath;
  return lastSegment === "ddd";
}
