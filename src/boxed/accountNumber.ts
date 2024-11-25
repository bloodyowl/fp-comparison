import type { TechnicalError } from "#app/shared/errors.ts";
import type { AccountCountry } from "#app/shared/onboarding.ts";
import type { Future, Result } from "@swan-io/boxed";

export type IbanType = "Main" | "Virtual";

export declare function generateAccountNumber(
  ibanType: IbanType,
  country: AccountCountry
): Future<Result<string, TechnicalError>>;
