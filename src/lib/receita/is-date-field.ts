const RECEITA_DATE_FIELD_SEGMENTS = new Set([
  "data_situacao_cadastral",
  "data_inicio_atividade",
  "data_entrada_sociedade",
]);

/** Receita fields whose values are ISO dates (not numeric codes). */
export function isReceitaDateField(fieldPath: string): boolean {
  const lastSegment = fieldPath.split(".").pop()?.replace(/\[\d+\]$/, "") ?? fieldPath;
  return RECEITA_DATE_FIELD_SEGMENTS.has(lastSegment);
}
