import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Option } from "fp-ts/Option";
import type { TaskEither } from "fp-ts/TaskEither";

export type AccountHolder = {
  address1: string;
};

export declare function findAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context,
): TaskEither<TechnicalError, Option<AccountHolder>>;

export declare function createAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context,
): TaskEither<TechnicalError, AccountHolder>;
