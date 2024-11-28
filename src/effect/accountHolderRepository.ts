import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Effect } from "effect/Effect";
import type { Option } from "effect/Option";

export type AccountHolder = {
  address1: string;
};

export declare function findAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context,
): Effect<Option<AccountHolder>, TechnicalError>;

export declare function createAccountHolderByIdentityAndProject(
  identityId: string,
  projectId: string,
  context: Context,
): Effect<AccountHolder, TechnicalError>;
