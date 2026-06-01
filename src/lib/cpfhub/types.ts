export type CpfHubGender = "M" | "F";

export type CpfHubPerson = {
  cpf: string;
  name: string;
  nameUpper: string;
  gender: CpfHubGender;
  birthDate: string;
  day: number;
  month: number;
  year: number;
};

export type CpfHubLookupResult =
  | {
      ok: true;
      cpf: string;
      data: CpfHubPerson;
      remainingCredits: number | null;
    }
  | {
      ok: false;
      cpf: string;
      error: string;
      status?: number;
      code?: string;
    };
