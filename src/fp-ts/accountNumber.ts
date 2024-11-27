import type { TechnicalError } from "#app/shared/errors.ts";
import type { AccountCountry } from "#app/shared/onboarding.ts";
import type { TaskEither } from "fp-ts/TaskEither";

export type IbanType = "Main" | "Virtual";

export declare function generateAccountNumber(
  ibanType: IbanType,
  country: AccountCountry,
): TaskEither<TechnicalError, string>;
