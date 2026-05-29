/** Receita fields that carry a CNAE subclass code without an activity description. */
export function isReceitaCnaeField(fieldPath: string): boolean {
  const lastSegment = fieldPath.split(".").pop()?.replace(/\[\d+\]$/, "") ?? fieldPath;
  return lastSegment === "cnae_principal" || lastSegment === "cnaes_secundarios";
}
