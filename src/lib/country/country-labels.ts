import type { Locale } from "@/lib/brcode/labels";

export type CountryLabel = {
  name: { en?: string; pt: string };
};

/** Localized country names; ISO reference data fills gaps for English. */
export const COUNTRY_LABELS: Readonly<Partial<Record<string, CountryLabel>>> = {
  "AD": {
    name: { pt: "Andorra" },
  },
  "AE": {
    name: { pt: "Emirados Árabes Unidos" },
  },
  "AF": {
    name: { pt: "Afeganistão" },
  },
  "AG": {
    name: { pt: "Antígua e Barbuda" },
  },
  "AI": {
    name: { pt: "Anguila" },
  },
  "AL": {
    name: { pt: "Albânia" },
  },
  "AM": {
    name: { pt: "Armênia" },
  },
  "AO": {
    name: { pt: "Angola" },
  },
  "AQ": {
    name: { pt: "Antártida" },
  },
  "AR": {
    name: { pt: "Argentina" },
  },
  "AS": {
    name: { pt: "Samoa Americana" },
  },
  "AT": {
    name: { pt: "Áustria" },
  },
  "AU": {
    name: { pt: "Austrália" },
  },
  "AW": {
    name: { pt: "Aruba" },
  },
  "AX": {
    name: { pt: "Ilhas Aland" },
  },
  "AZ": {
    name: { pt: "Azerbaijão" },
  },
  "BA": {
    name: { pt: "Bósnia e Herzegovina" },
  },
  "BB": {
    name: { pt: "Barbados" },
  },
  "BD": {
    name: { pt: "Bangladesh" },
  },
  "BE": {
    name: { pt: "Bélgica" },
  },
  "BF": {
    name: { pt: "Burquina Faso" },
  },
  "BG": {
    name: { pt: "Bulgária" },
  },
  "BH": {
    name: { pt: "Bahrein" },
  },
  "BI": {
    name: { pt: "Burundi" },
  },
  "BJ": {
    name: { pt: "Benin" },
  },
  "BL": {
    name: { pt: "São Bartolomeu" },
  },
  "BM": {
    name: { pt: "Bermudas" },
  },
  "BN": {
    name: { pt: "Brunei" },
  },
  "BO": {
    name: { pt: "Bolívia" },
  },
  "BQ": {
    name: { pt: "Países Baixos Caribenhos" },
  },
  "BR": {
    name: { pt: "Brasil" },
  },
  "BS": {
    name: { pt: "Bahamas" },
  },
  "BT": {
    name: { pt: "Butão" },
  },
  "BV": {
    name: { pt: "Ilha Bouvet" },
  },
  "BW": {
    name: { pt: "Botsuana" },
  },
  "BY": {
    name: { pt: "Bielorrússia" },
  },
  "BZ": {
    name: { pt: "Belize" },
  },
  "CA": {
    name: { pt: "Canadá" },
  },
  "CC": {
    name: { pt: "Ilhas Cocos (Keeling)" },
  },
  "CD": {
    name: { pt: "Congo - Kinshasa" },
  },
  "CF": {
    name: { pt: "República Centro-Africana" },
  },
  "CG": {
    name: { pt: "República do Congo" },
  },
  "CH": {
    name: { pt: "Suíça" },
  },
  "CI": {
    name: { pt: "Costa do Marfim" },
  },
  "CK": {
    name: { pt: "Ilhas Cook" },
  },
  "CL": {
    name: { pt: "Chile" },
  },
  "CM": {
    name: { pt: "Camarões" },
  },
  "CN": {
    name: { pt: "China" },
  },
  "CO": {
    name: { pt: "Colômbia" },
  },
  "CR": {
    name: { pt: "Costa Rica" },
  },
  "CU": {
    name: { pt: "Cuba" },
  },
  "CV": {
    name: { pt: "Cabo Verde" },
  },
  "CW": {
    name: { pt: "Curaçao" },
  },
  "CX": {
    name: { pt: "Ilha Christmas" },
  },
  "CY": {
    name: { pt: "Chipre" },
  },
  "CZ": {
    name: { pt: "Tchéquia" },
  },
  "DE": {
    name: { pt: "Alemanha" },
  },
  "DJ": {
    name: { pt: "Djibuti" },
  },
  "DK": {
    name: { pt: "Dinamarca" },
  },
  "DM": {
    name: { pt: "Dominica" },
  },
  "DO": {
    name: { pt: "República Dominicana" },
  },
  "DZ": {
    name: { pt: "Argélia" },
  },
  "EC": {
    name: { pt: "Equador" },
  },
  "EE": {
    name: { pt: "Estônia" },
  },
  "EG": {
    name: { pt: "Egito" },
  },
  "EH": {
    name: { pt: "Saara Ocidental" },
  },
  "ER": {
    name: { pt: "Eritreia" },
  },
  "ES": {
    name: { pt: "Espanha" },
  },
  "ET": {
    name: { pt: "Etiópia" },
  },
  "FI": {
    name: { pt: "Finlândia" },
  },
  "FJ": {
    name: { pt: "Fiji" },
  },
  "FK": {
    name: { pt: "Ilhas Malvinas" },
  },
  "FM": {
    name: { pt: "Micronésia" },
  },
  "FO": {
    name: { pt: "Ilhas Faroe" },
  },
  "FR": {
    name: { pt: "França" },
  },
  "GA": {
    name: { pt: "Gabão" },
  },
  "GB": {
    name: { pt: "Reino Unido" },
  },
  "GD": {
    name: { pt: "Granada" },
  },
  "GE": {
    name: { pt: "Geórgia" },
  },
  "GF": {
    name: { pt: "Guiana Francesa" },
  },
  "GG": {
    name: { pt: "Guernsey" },
  },
  "GH": {
    name: { pt: "Gana" },
  },
  "GI": {
    name: { pt: "Gibraltar" },
  },
  "GL": {
    name: { pt: "Groenlândia" },
  },
  "GM": {
    name: { pt: "Gâmbia" },
  },
  "GN": {
    name: { pt: "Guiné" },
  },
  "GP": {
    name: { pt: "Guadalupe" },
  },
  "GQ": {
    name: { pt: "Guiné Equatorial" },
  },
  "GR": {
    name: { pt: "Grécia" },
  },
  "GS": {
    name: { pt: "Ilhas Geórgia do Sul e Sandwich do Sul" },
  },
  "GT": {
    name: { pt: "Guatemala" },
  },
  "GU": {
    name: { pt: "Guam" },
  },
  "GW": {
    name: { pt: "Guiné-Bissau" },
  },
  "GY": {
    name: { pt: "Guiana" },
  },
  "HK": {
    name: { pt: "Hong Kong, RAE da China" },
  },
  "HM": {
    name: { pt: "Ilhas Heard e McDonald" },
  },
  "HN": {
    name: { pt: "Honduras" },
  },
  "HR": {
    name: { pt: "Croácia" },
  },
  "HT": {
    name: { pt: "Haiti" },
  },
  "HU": {
    name: { pt: "Hungria" },
  },
  "ID": {
    name: { pt: "Indonésia" },
  },
  "IE": {
    name: { pt: "Irlanda" },
  },
  "IL": {
    name: { pt: "Israel" },
  },
  "IM": {
    name: { pt: "Ilha de Man" },
  },
  "IN": {
    name: { pt: "Índia" },
  },
  "IO": {
    name: { pt: "Território Britânico do Oceano Índico" },
  },
  "IQ": {
    name: { pt: "Iraque" },
  },
  "IR": {
    name: { pt: "Irã" },
  },
  "IS": {
    name: { pt: "Islândia" },
  },
  "IT": {
    name: { pt: "Itália" },
  },
  "JE": {
    name: { pt: "Jersey" },
  },
  "JM": {
    name: { pt: "Jamaica" },
  },
  "JO": {
    name: { pt: "Jordânia" },
  },
  "JP": {
    name: { pt: "Japão" },
  },
  "KE": {
    name: { pt: "Quênia" },
  },
  "KG": {
    name: { pt: "Quirguistão" },
  },
  "KH": {
    name: { pt: "Camboja" },
  },
  "KI": {
    name: { pt: "Quiribati" },
  },
  "KM": {
    name: { pt: "Comores" },
  },
  "KN": {
    name: { pt: "São Cristóvão e Névis" },
  },
  "KP": {
    name: { pt: "Coreia do Norte" },
  },
  "KR": {
    name: { pt: "Coreia do Sul" },
  },
  "KW": {
    name: { pt: "Kuwait" },
  },
  "KY": {
    name: { pt: "Ilhas Cayman" },
  },
  "KZ": {
    name: { pt: "Cazaquistão" },
  },
  "LA": {
    name: { pt: "Laos" },
  },
  "LB": {
    name: { pt: "Líbano" },
  },
  "LC": {
    name: { pt: "Santa Lúcia" },
  },
  "LI": {
    name: { pt: "Liechtenstein" },
  },
  "LK": {
    name: { pt: "Sri Lanka" },
  },
  "LR": {
    name: { pt: "Libéria" },
  },
  "LS": {
    name: { pt: "Lesoto" },
  },
  "LT": {
    name: { pt: "Lituânia" },
  },
  "LU": {
    name: { pt: "Luxemburgo" },
  },
  "LV": {
    name: { pt: "Letônia" },
  },
  "LY": {
    name: { pt: "Líbia" },
  },
  "MA": {
    name: { pt: "Marrocos" },
  },
  "MC": {
    name: { pt: "Mônaco" },
  },
  "MD": {
    name: { pt: "Moldova" },
  },
  "ME": {
    name: { pt: "Montenegro" },
  },
  "MF": {
    name: { pt: "São Martinho" },
  },
  "MG": {
    name: { pt: "Madagascar" },
  },
  "MH": {
    name: { pt: "Ilhas Marshall" },
  },
  "MK": {
    name: { pt: "Macedônia do Norte" },
  },
  "ML": {
    name: { pt: "Mali" },
  },
  "MM": {
    name: { pt: "Mianmar (Birmânia)" },
  },
  "MN": {
    name: { pt: "Mongólia" },
  },
  "MO": {
    name: { pt: "Macau, RAE da China" },
  },
  "MP": {
    name: { pt: "Ilhas Marianas do Norte" },
  },
  "MQ": {
    name: { pt: "Martinica" },
  },
  "MR": {
    name: { pt: "Mauritânia" },
  },
  "MS": {
    name: { pt: "Montserrat" },
  },
  "MT": {
    name: { pt: "Malta" },
  },
  "MU": {
    name: { pt: "Maurício" },
  },
  "MV": {
    name: { pt: "Maldivas" },
  },
  "MW": {
    name: { pt: "Malaui" },
  },
  "MX": {
    name: { pt: "México" },
  },
  "MY": {
    name: { pt: "Malásia" },
  },
  "MZ": {
    name: { pt: "Moçambique" },
  },
  "NA": {
    name: { pt: "Namíbia" },
  },
  "NC": {
    name: { pt: "Nova Caledônia" },
  },
  "NE": {
    name: { pt: "Níger" },
  },
  "NF": {
    name: { pt: "Ilha Norfolk" },
  },
  "NG": {
    name: { pt: "Nigéria" },
  },
  "NI": {
    name: { pt: "Nicarágua" },
  },
  "NL": {
    name: { pt: "Países Baixos" },
  },
  "NO": {
    name: { pt: "Noruega" },
  },
  "NP": {
    name: { pt: "Nepal" },
  },
  "NR": {
    name: { pt: "Nauru" },
  },
  "NU": {
    name: { pt: "Niue" },
  },
  "NZ": {
    name: { pt: "Nova Zelândia" },
  },
  "OM": {
    name: { pt: "Omã" },
  },
  "PA": {
    name: { pt: "Panamá" },
  },
  "PE": {
    name: { pt: "Peru" },
  },
  "PF": {
    name: { pt: "Polinésia Francesa" },
  },
  "PG": {
    name: { pt: "Papua-Nova Guiné" },
  },
  "PH": {
    name: { pt: "Filipinas" },
  },
  "PK": {
    name: { pt: "Paquistão" },
  },
  "PL": {
    name: { pt: "Polônia" },
  },
  "PM": {
    name: { pt: "São Pedro e Miquelão" },
  },
  "PN": {
    name: { pt: "Ilhas Pitcairn" },
  },
  "PR": {
    name: { pt: "Porto Rico" },
  },
  "PS": {
    name: { pt: "Territórios palestinos" },
  },
  "PT": {
    name: { pt: "Portugal" },
  },
  "PW": {
    name: { pt: "Palau" },
  },
  "PY": {
    name: { pt: "Paraguai" },
  },
  "QA": {
    name: { pt: "Catar" },
  },
  "RE": {
    name: { pt: "Reunião" },
  },
  "RO": {
    name: { pt: "Romênia" },
  },
  "RS": {
    name: { pt: "Sérvia" },
  },
  "RU": {
    name: { pt: "Rússia" },
  },
  "RW": {
    name: { pt: "Ruanda" },
  },
  "SA": {
    name: { pt: "Arábia Saudita" },
  },
  "SB": {
    name: { pt: "Ilhas Salomão" },
  },
  "SC": {
    name: { pt: "Seicheles" },
  },
  "SD": {
    name: { pt: "Sudão" },
  },
  "SE": {
    name: { pt: "Suécia" },
  },
  "SG": {
    name: { pt: "Singapura" },
  },
  "SH": {
    name: { pt: "Santa Helena" },
  },
  "SI": {
    name: { pt: "Eslovênia" },
  },
  "SJ": {
    name: { pt: "Svalbard e Jan Mayen" },
  },
  "SK": {
    name: { pt: "Eslováquia" },
  },
  "SL": {
    name: { pt: "Serra Leoa" },
  },
  "SM": {
    name: { pt: "San Marino" },
  },
  "SN": {
    name: { pt: "Senegal" },
  },
  "SO": {
    name: { pt: "Somália" },
  },
  "SR": {
    name: { pt: "Suriname" },
  },
  "SS": {
    name: { pt: "Sudão do Sul" },
  },
  "ST": {
    name: { pt: "São Tomé e Príncipe" },
  },
  "SV": {
    name: { pt: "El Salvador" },
  },
  "SX": {
    name: { pt: "Sint Maarten" },
  },
  "SY": {
    name: { pt: "Síria" },
  },
  "SZ": {
    name: { pt: "Essuatíni" },
  },
  "TC": {
    name: { pt: "Ilhas Turcas e Caicos" },
  },
  "TD": {
    name: { pt: "Chade" },
  },
  "TF": {
    name: { pt: "Territórios Franceses do Sul" },
  },
  "TG": {
    name: { pt: "Togo" },
  },
  "TH": {
    name: { pt: "Tailândia" },
  },
  "TJ": {
    name: { pt: "Tadjiquistão" },
  },
  "TK": {
    name: { pt: "Tokelau" },
  },
  "TL": {
    name: { pt: "Timor-Leste" },
  },
  "TM": {
    name: { pt: "Turcomenistão" },
  },
  "TN": {
    name: { pt: "Tunísia" },
  },
  "TO": {
    name: { pt: "Tonga" },
  },
  "TR": {
    name: { pt: "Turquia" },
  },
  "TT": {
    name: { pt: "Trinidad e Tobago" },
  },
  "TV": {
    name: { pt: "Tuvalu" },
  },
  "TW": {
    name: { pt: "Taiwan" },
  },
  "TZ": {
    name: { pt: "Tanzânia" },
  },
  "UA": {
    name: { pt: "Ucrânia" },
  },
  "UG": {
    name: { pt: "Uganda" },
  },
  "UM": {
    name: { pt: "Ilhas Menores Distantes dos EUA" },
  },
  "US": {
    name: { pt: "Estados Unidos" },
  },
  "UY": {
    name: { pt: "Uruguai" },
  },
  "UZ": {
    name: { pt: "Uzbequistão" },
  },
  "VA": {
    name: { pt: "Cidade do Vaticano" },
  },
  "VC": {
    name: { pt: "São Vicente e Granadinas" },
  },
  "VE": {
    name: { pt: "Venezuela" },
  },
  "VG": {
    name: { pt: "Ilhas Virgens Britânicas" },
  },
  "VI": {
    name: { pt: "Ilhas Virgens Americanas" },
  },
  "VN": {
    name: { pt: "Vietnã" },
  },
  "VU": {
    name: { pt: "Vanuatu" },
  },
  "WF": {
    name: { pt: "Wallis e Futuna" },
  },
  "WS": {
    name: { pt: "Samoa" },
  },
  "YE": {
    name: { pt: "Iêmen" },
  },
  "YT": {
    name: { pt: "Mayotte" },
  },
  "ZA": {
    name: { pt: "África do Sul" },
  },
  "ZM": {
    name: { pt: "Zâmbia" },
  },
  "ZW": {
    name: { pt: "Zimbábue" },
  },
};

export function getManualCountryLabel(
  alpha2: string,
  locale: Locale,
): { name: string } | null {
  const entry = COUNTRY_LABELS[alpha2];
  if (!entry) return null;
  if (locale === "pt" && entry.name.pt) {
    return { name: entry.name.pt };
  }
  if (locale === "en" && entry.name.en) {
    return { name: entry.name.en };
  }
  return null;
}