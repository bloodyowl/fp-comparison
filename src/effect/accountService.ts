import type { AccountHolder } from "#app/effect/accountHolderRepository.ts";
import type { IbanType } from "#app/effect/accountNumber.ts";
import type { Onboarding } from "#app/effect/finalizeOnboardingTypes.ts";
import type { SwanTCUDocument } from "#app/effect/tcuRepository.ts";
import type {
  InvalidPhoneNumberError,
  MissingBirthDateRestrictionError,
  TechnicalError,
} from "#app/shared/errors.ts";
import type { Effect } from "effect/Effect";
import type { Option } from "effect/Option";
export type Account = {
  id: string;
  accountNumber: string;
  country: string;
  projectId: string;
  accountHolderId: string;
};

export declare function createAndPersistAccount(
  onboarding: Onboarding,
  accountHolder: AccountHolder,
  accountNumber: string,
  maybeTcuDocument: Option<SwanTCUDocument>,
): Effect<
  Account,
  TechnicalError | InvalidPhoneNumberError | MissingBirthDateRestrictionError
>;

export type IbanEntry = {
  accountId: string;
  bic: string;
  blockSDD: boolean;
  createdAt: Date;
  iban: string;
  id: string;
  isVirtual: boolean;
  label: string;
  projectId: string;
  status: string;
  updatedAt: Date;
};

export declare function createIban(input: {
  accountId: string;
  accountNumber: string;
  country: string;
  projectId: string;
  type: IbanType;
}): Effect<IbanEntry, TechnicalError>;
