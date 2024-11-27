import type { AccountHolder } from "#app/fp-ts/accountHolderRepository.ts";
import type { IbanType } from "#app/fp-ts/accountNumber.ts";
import type { Onboarding } from "#app/fp-ts/finalizeOnboardingTypes.ts";
import type { SwanTCUDocument } from "#app/fp-ts/tcuRepository.ts";
import type {
  InvalidPhoneNumberError,
  MissingBirthDateRestrictionError,
  TechnicalError,
} from "#app/shared/errors.ts";
import type { Option } from "fp-ts/Option";
import type { TaskEither } from "fp-ts/TaskEither";

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
): TaskEither<
  TechnicalError | InvalidPhoneNumberError | MissingBirthDateRestrictionError,
  Account
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
}): TaskEither<TechnicalError, IbanEntry>;
