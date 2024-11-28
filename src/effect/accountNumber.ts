import type { TechnicalError } from "#app/shared/errors.ts";
import type { AccountCountry } from "#app/shared/onboarding.ts";
import type { Effect } from "effect/Effect";

export type IbanType = "Main" | "Virtual";

export declare function generateAccountNumber(
  ibanType: IbanType,
  country: AccountCountry,
): Effect<string, TechnicalError>;
