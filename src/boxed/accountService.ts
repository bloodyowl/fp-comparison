import type { AccountHolder } from "#app/boxed/accountHolderRepository.ts";
import type { IbanType } from "#app/boxed/accountNumber.ts";
import type { Onboarding } from "#app/boxed/finalizeOnboardingTypes.ts";
import type { SwanTCUDocument } from "#app/boxed/tcuRepository.ts";
import type {
  InvalidPhoneNumberError,
  MissingBirthDateRestrictionError,
  TechnicalError,
} from "#app/shared/errors.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

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
  maybeTcuDocument: Option<SwanTCUDocument>
): Future<
  Result<
    Account,
    TechnicalError | InvalidPhoneNumberError | MissingBirthDateRestrictionError
  >
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
}): Future<Result<IbanEntry, TechnicalError>>;
