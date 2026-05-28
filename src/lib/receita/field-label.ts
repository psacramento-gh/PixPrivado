import type { Locale } from "@/lib/brcode/labels";
import type { MessageKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const PATH_LABEL_KEYS: Record<string, MessageKey> = {
  cnpj: "receitaFieldCnpj",
  razao_social: "receitaFieldRazaoSocial",
  nome_fantasia: "receitaFieldNomeFantasia",
  situacao_cadastral: "receitaFieldSituacaoCadastral",
  data_situacao_cadastral: "receitaFieldDataSituacaoCadastral",
  matriz_filial: "receitaFieldMatrizFilial",
  data_inicio_atividade: "receitaFieldDataInicioAtividade",
  cnae_principal: "receitaFieldCnaePrincipal",
  cnaes_secundarios: "receitaFieldCnaesSecundarios",
  cnaes: "receitaFieldCnaes",
  natureza_juridica: "receitaFieldNaturezaJuridica",
  tipo_logradouro: "receitaFieldTipoLogradouro",
  logradouro: "receitaFieldLogradouro",
  numero: "receitaFieldNumero",
  complemento: "receitaFieldComplemento",
  bairro: "receitaFieldBairro",
  cep: "receitaFieldCep",
  uf: "receitaFieldUf",
  municipio: "receitaFieldMunicipio",
  codigo_municipio: "receitaFieldCodigoMunicipio",
  email: "receitaFieldEmail",
  telefones: "receitaFieldTelefones",
  capital_social: "receitaFieldCapitalSocial",
  porte_empresa: "receitaFieldPorteEmpresa",
  opcao_simples: "receitaFieldOpcaoSimples",
  opcao_mei: "receitaFieldOpcaoMei",
  motivo_situacao_cadastral: "receitaFieldMotivoSituacaoCadastral",
  QSA: "receitaFieldQsa",
  nome_socio: "receitaFieldNomeSocio",
  cnpj_cpf_socio: "receitaFieldCnpjCpfSocio",
  qualificacao_socio: "receitaFieldQualificacaoSocio",
  data_entrada_sociedade: "receitaFieldDataEntradaSociedade",
  identificador_socio: "receitaFieldIdentificadorSocio",
  codigo: "receitaFieldCodigo",
  descricao: "receitaFieldDescricao",
  is_principal: "receitaFieldIsPrincipal",
};

function humanizePath(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, " $1")
    .replace(/\./g, " · ")
    .replace(/_/g, " ");
}

export function receitaFieldLabel(path: string, locale: Locale): string {
  const lastSegment = path.split(".").pop()?.replace(/\[\d+\]$/, "") ?? path;
  const bracketRoot = path.match(/^([^[]+)\[\d+\]/)?.[1];
  const key = PATH_LABEL_KEYS[path] ?? PATH_LABEL_KEYS[lastSegment] ?? (bracketRoot ? PATH_LABEL_KEYS[bracketRoot] : undefined);
  if (key) {
    const label = t(locale, key);
    if (path !== lastSegment && path.includes(".")) {
      return `${label} (${humanizePath(path)})`;
    }
    if (/\[\d+\]/.test(path) && bracketRoot && PATH_LABEL_KEYS[bracketRoot]) {
      const index = path.match(/\[(\d+)\]/)?.[1];
      return index ? `${label} ${index}` : label;
    }
    return label;
  }
  return humanizePath(path);
}
