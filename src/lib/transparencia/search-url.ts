const PESSOA_FISICA_LISTA =
  "https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista";
const PESSOA_JURIDICA_LISTA =
  "https://portaldatransparencia.gov.br/pessoa-juridica/busca/lista";

function listaUrl(base: string, termo: string): string {
  const params = new URLSearchParams({
    termo,
    pagina: "1",
    tamanhoPagina: "10",
  });
  return `${base}?${params.toString()}`;
}

export function buildPessoaFisicaSearchUrl(termo: string): string {
  return listaUrl(PESSOA_FISICA_LISTA, termo.trim());
}

export function buildPessoaJuridicaSearchUrl(termo: string): string {
  return listaUrl(PESSOA_JURIDICA_LISTA, termo.trim());
}
