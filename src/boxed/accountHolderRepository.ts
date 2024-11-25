import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

export type AccountHolder = {
  address1: string;
};

export declare function findAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context
): Future<Result<Option<AccountHolder>, TechnicalError>>;

export declare function createAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context
): Future<Result<AccountHolder, TechnicalError>>;
