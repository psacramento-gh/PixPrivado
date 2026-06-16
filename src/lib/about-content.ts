import type { Locale } from "@/lib/brcode/labels";

export type AboutBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "emphasis"; text: string }
  | {
      kind: "contrast";
      items: { label: string; body: string }[];
    };

export type AboutSection = {
  heading: string;
  blocks: AboutBlock[];
};

export type AboutPageContent = {
  title: string;
  intro: AboutBlock[];
  sections: AboutSection[];
};

const aboutEn: AboutPageContent = {
  title: "About this project",
  intro: [
    {
      kind: "paragraph",
      text: "Pix payment information often looks harmless.",
    },
    {
      kind: "paragraph",
      text: 'A QR code, a Pix key, or a "Copia e Cola" string can seem like a simple way to receive a payment. But behind that simple interaction there may be structured data, reusable identifiers, merchant information, dynamic payment links, and details that can make a person or business easier to identify, track, or target.',
    },
    {
      kind: "paragraph",
      text: "This project started from a simple question:",
    },
    {
      kind: "emphasis",
      text: "What does someone actually reveal when they share Pix payment information?",
    },
    {
      kind: "paragraph",
      text: "Pix Private was created to make that hidden layer visible. It allows people to inspect Pix QR codes, Copia e Cola payment strings, and related Pix metadata in a readable way. The goal is not only to decode technical data, but to help people understand the privacy and security implications of sharing payment information with others.",
    },
  ],
  sections: [
    {
      heading: "Why it exists",
      blocks: [
        {
          kind: "paragraph",
          text: "In everyday life, people share Pix information casually. They send it in WhatsApp groups, post it on social media, add it to donation campaigns, use it in marketplaces, or display it for small business payments.",
        },
        {
          kind: "paragraph",
          text: "Most people do not see this as sharing personal information. They see it as sharing a payment shortcut.",
        },
        {
          kind: "paragraph",
          text: "But depending on the type of Pix key and QR code, that payment information may reveal or point to details such as names, phone numbers, email addresses, CPF or CNPJ-related identifiers, merchant information, payment endpoints, and reusable references.",
        },
        {
          kind: "paragraph",
          text: "The risk becomes more serious when these identifiers can be combined with leaked databases, public records, people-search tools, or other external sources. A single payment identifier can become a bridge into a much larger data ecosystem.",
        },
        {
          kind: "paragraph",
          text: "This tool was built to demonstrate that risk in a concrete and accessible way.",
        },
      ],
    },
    {
      heading: "What the tool does",
      blocks: [
        {
          kind: "paragraph",
          text: "The application helps users inspect Pix payment information before sharing it or after encountering it.",
        },
        {
          kind: "paragraph",
          text: "It can decode Pix QR codes from images, read Pix Copia e Cola strings, parse the underlying payment payload, validate the structure of the code, identify relevant fields, and explain what kind of information may be exposed.",
        },
        {
          kind: "paragraph",
          text: "Instead of showing only technical fields, the long-term goal is to help users answer a practical question:",
        },
        {
          kind: "emphasis",
          text: "How vulnerable could I, my family, my business, or someone I care about become by sharing this Pix payment information?",
        },
      ],
    },
    {
      heading: "Who it is for",
      blocks: [
        {
          kind: "paragraph",
          text: "This tool is for people who want to better understand the privacy risks of Pix payment data.",
        },
        {
          kind: "paragraph",
          text: "It can be useful for individuals who share Pix keys publicly, small business owners, journalists, privacy researchers, security professionals, UX researchers, educators, activists, and anyone studying digital payment infrastructure.",
        },
        {
          kind: "paragraph",
          text: "It can also help people support family members, friends, clients, or communities who may not realize that a simple payment QR code can expose more than expected.",
        },
      ],
    },
    {
      heading: "What makes it different",
      blocks: [
        {
          kind: "paragraph",
          text: "Most QR tools only tell you what a QR code contains.",
        },
        {
          kind: "paragraph",
          text: "This project goes further.",
        },
        {
          kind: "paragraph",
          text: "It focuses specifically on Pix payment information and the privacy risks created by identifiers, metadata, and linkability. It does not treat the QR code as just a technical object. It treats it as part of a broader social and financial infrastructure.",
        },
        {
          kind: "paragraph",
          text: "The tool helps reveal the gap between what people think they are sharing and what the payment information may actually expose.",
        },
        {
          kind: "paragraph",
          text: "That contrast is the core of the project:",
        },
        {
          kind: "contrast",
          items: [
            {
              label: "What you see:",
              body: "a payment QR code.",
            },
            {
              label: "What may be inside:",
              body: "identity-bearing payment metadata.",
            },
            {
              label: "What it may become:",
              body: "a link to broader personal or business exposure.",
            },
          ],
        },
      ],
    },
    {
      heading: "The bigger purpose",
      blocks: [
        {
          kind: "paragraph",
          text: "This project is part of a broader effort to show why privacy must be treated as infrastructure.",
        },
        {
          kind: "paragraph",
          text: "Digital payment systems are not only about speed, convenience, and adoption. They also shape how much information people reveal in everyday economic life.",
        },
        {
          kind: "paragraph",
          text: "When payment identifiers become easy to copy, search, combine, and analyze, privacy risks move from rare events to ordinary interactions.",
        },
        {
          kind: "paragraph",
          text: "The goal of this tool is to make those risks visible before harm happens.",
        },
        {
          kind: "paragraph",
          text: "It is a public-interest tool for awareness, education, and digital self-defense.",
        },
      ],
    },
    {
      heading: "Breach lookups",
      blocks: [
        {
          kind: "paragraph",
          text: "When you click an email address in the decoded payload, the app can check whether that address appears in known data breaches using the Have I Been Pwned (HIBP) API.",
        },
        {
          kind: "paragraph",
          text: "These lookups are proxied through this app's server so your API key stays private, but the full email address is sent to HIBP for each search, in line with their terms of use. A clean result does not guarantee the address was never exposed — sensitive or retired breaches are not returned by the public email API.",
        },
      ],
    },
    {
      heading: "Responsible use",
      blocks: [
        {
          kind: "paragraph",
          text: "This project is intended for privacy awareness, research, education, and defensive analysis.",
        },
        {
          kind: "paragraph",
          text: "It should be used to understand your own exposure, support people who want to evaluate their own payment information, or study the design implications of modern instant payment systems.",
        },
        {
          kind: "paragraph",
          text: "The purpose is not to expose, harass, or investigate people without consent. The purpose is to help people make better decisions before they share payment information publicly or with people they do not fully trust.",
        },
      ],
    },
    {
      heading: "In one sentence",
      blocks: [
        {
          kind: "emphasis",
          text: "This tool helps people see what Pix payment information may reveal, so they can better understand and reduce their exposure before sharing it.",
        },
      ],
    },
  ],
};

const aboutPt: AboutPageContent = {
  title: "Sobre este projeto",
  intro: [
    {
      kind: "paragraph",
      text: "Informações de pagamento Pix muitas vezes parecem inofensivas.",
    },
    {
      kind: "paragraph",
      text: 'Um QR code, uma chave Pix ou um texto "Copia e Cola" podem parecer um jeito simples de receber um pagamento. Mas por trás dessa interação simples pode haver dados estruturados, identificadores reutilizáveis, informações de comerciante, links de pagamento dinâmicos e detalhes que podem tornar uma pessoa ou empresa mais fácil de identificar, rastrear ou direcionar.',
    },
    {
      kind: "paragraph",
      text: "Este projeto começou com uma pergunta simples:",
    },
    {
      kind: "emphasis",
      text: "O que alguém realmente revela ao compartilhar informações de pagamento Pix?",
    },
    {
      kind: "paragraph",
      text: "O Pix Privado foi criado para tornar essa camada oculta visível. Ele permite inspecionar QR codes Pix, strings Copia e Cola e metadados Pix relacionados de forma legível. O objetivo não é apenas decodificar dados técnicos, mas ajudar as pessoas a entender as implicações de privacidade e segurança de compartilhar informações de pagamento com outras pessoas.",
    },
  ],
  sections: [
    {
      heading: "Por que existe",
      blocks: [
        {
          kind: "paragraph",
          text: "No dia a dia, as pessoas compartilham informações Pix de forma casual. Enviam em grupos de WhatsApp, publicam em redes sociais, usam em campanhas de doação, em marketplaces ou exibem para pagamentos de pequenos negócios.",
        },
        {
          kind: "paragraph",
          text: "A maioria não vê isso como compartilhar informações pessoais. Vê como compartilhar um atalho de pagamento.",
        },
        {
          kind: "paragraph",
          text: "Mas, dependendo do tipo de chave Pix e do QR code, essas informações podem revelar ou apontar para detalhes como nomes, telefones, e-mails, identificadores ligados a CPF ou CNPJ, dados de comerciante, endpoints de pagamento e referências reutilizáveis.",
        },
        {
          kind: "paragraph",
          text: "O risco fica mais sério quando esses identificadores podem ser combinados com bases vazadas, registros públicos, ferramentas de busca de pessoas ou outras fontes externas. Um único identificador de pagamento pode virar uma ponte para um ecossistema de dados muito maior.",
        },
        {
          kind: "paragraph",
          text: "Esta ferramenta foi construída para demonstrar esse risco de forma concreta e acessível.",
        },
      ],
    },
    {
      heading: "O que a ferramenta faz",
      blocks: [
        {
          kind: "paragraph",
          text: "O aplicativo ajuda a inspecionar informações de pagamento Pix antes de compartilhá-las ou depois de encontrá-las.",
        },
        {
          kind: "paragraph",
          text: "Ele pode decodificar QR codes Pix a partir de imagens, ler strings Copia e Cola, analisar o payload de pagamento subjacente, validar a estrutura do código, identificar campos relevantes e explicar que tipo de informação pode ser exposta.",
        },
        {
          kind: "paragraph",
          text: "Em vez de mostrar apenas campos técnicos, o objetivo de longo prazo é ajudar a responder a uma pergunta prática:",
        },
        {
          kind: "emphasis",
          text: "Quão vulneráveis eu, minha família, meu negócio ou alguém de quem me importo poderíamos ficar ao compartilhar essas informações de pagamento Pix?",
        },
      ],
    },
    {
      heading: "Para quem é",
      blocks: [
        {
          kind: "paragraph",
          text: "Esta ferramenta é para quem quer entender melhor os riscos de privacidade dos dados de pagamento Pix.",
        },
        {
          kind: "paragraph",
          text: "Pode ser útil para quem compartilha chaves Pix publicamente, donos de pequenos negócios, jornalistas, pesquisadores de privacidade, profissionais de segurança, pesquisadores de UX, educadores, ativistas e qualquer pessoa que estuda infraestrutura de pagamentos digitais.",
        },
        {
          kind: "paragraph",
          text: "Também pode ajudar quem apoia familiares, amigos, clientes ou comunidades que talvez não percebam que um simples QR code de pagamento pode expor mais do que o esperado.",
        },
      ],
    },
    {
      heading: "O que a diferencia",
      blocks: [
        {
          kind: "paragraph",
          text: "A maioria das ferramentas de QR só diz o que um código contém.",
        },
        {
          kind: "paragraph",
          text: "Este projeto vai além.",
        },
        {
          kind: "paragraph",
          text: "Ele foca especificamente em informações de pagamento Pix e nos riscos de privacidade criados por identificadores, metadados e capacidade de vinculação. Não trata o QR code apenas como um objeto técnico, mas como parte de uma infraestrutura social e financeira mais ampla.",
        },
        {
          kind: "paragraph",
          text: "A ferramenta ajuda a revelar a diferença entre o que as pessoas acham que estão compartilhando e o que a informação de pagamento pode de fato expor.",
        },
        {
          kind: "paragraph",
          text: "Esse contraste é o núcleo do projeto:",
        },
        {
          kind: "contrast",
          items: [
            {
              label: "O que você vê:",
              body: "um QR code de pagamento.",
            },
            {
              label: "O que pode estar dentro:",
              body: "metadados de pagamento que carregam identidade.",
            },
            {
              label: "O que isso pode virar:",
              body: "um elo para exposição pessoal ou empresarial mais ampla.",
            },
          ],
        },
      ],
    },
    {
      heading: "O propósito maior",
      blocks: [
        {
          kind: "paragraph",
          text: "Este projeto faz parte de um esforço mais amplo para mostrar por que a privacidade precisa ser tratada como infraestrutura.",
        },
        {
          kind: "paragraph",
          text: "Sistemas de pagamento digital não são só velocidade, conveniência e adoção. Eles também moldam quanta informação as pessoas revelam na vida econômica cotidiana.",
        },
        {
          kind: "paragraph",
          text: "Quando identificadores de pagamento ficam fáceis de copiar, buscar, combinar e analisar, riscos de privacidade deixam de ser eventos raros e passam a fazer parte de interações comuns.",
        },
        {
          kind: "paragraph",
          text: "O objetivo desta ferramenta é tornar esses riscos visíveis antes que o dano aconteça.",
        },
        {
          kind: "paragraph",
          text: "É uma ferramenta de interesse público para conscientização, educação e autodefesa digital.",
        },
      ],
    },
    {
      heading: "Consultas de vazamentos",
      blocks: [
        {
          kind: "paragraph",
          text: "Ao clicar em um endereço de e-mail no payload decodificado, o app pode verificar se esse endereço aparece em vazamentos conhecidos usando a API do Have I Been Pwned (HIBP).",
        },
        {
          kind: "paragraph",
          text: "Essas consultas passam pelo servidor deste app para manter a chave de API privada, mas o endereço de e-mail completo é enviado ao HIBP em cada busca, conforme os termos de uso deles. Um resultado limpo não garante que o endereço nunca foi exposto — vazamentos sensíveis ou retirados não são retornados pela API pública de e-mail.",
        },
      ],
    },
    {
      heading: "Uso responsável",
      blocks: [
        {
          kind: "paragraph",
          text: "Este projeto é destinado à conscientização sobre privacidade, pesquisa, educação e análise defensiva.",
        },
        {
          kind: "paragraph",
          text: "Deve ser usado para entender a própria exposição, apoiar quem quer avaliar suas próprias informações de pagamento ou estudar implicações de desenho de sistemas de pagamento instantâneo modernos.",
        },
        {
          kind: "paragraph",
          text: "O propósito não é expor, assediar ou investigar pessoas sem consentimento. O propósito é ajudar a tomar melhores decisões antes de compartilhar informações de pagamento publicamente ou com pessoas em quem não se confia plenamente.",
        },
      ],
    },
    {
      heading: "Em uma frase",
      blocks: [
        {
          kind: "emphasis",
          text: "Esta ferramenta ajuda a ver o que informações de pagamento Pix podem revelar, para entender e reduzir melhor a exposição antes de compartilhá-las.",
        },
      ],
    },
  ],
};

export const aboutContent: Record<Locale, AboutPageContent> = {
  en: aboutEn,
  pt: aboutPt,
};

export function getAboutContent(locale: Locale): AboutPageContent {
  return aboutContent[locale];
}
