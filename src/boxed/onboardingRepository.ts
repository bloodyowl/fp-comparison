import type { Onboarding } from "#app/boxed/finalizeOnboardingTypes.ts";
import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

export declare function findById(
  onboardingId: string,
  context: Context,
): Future<Result<Option<Onboarding>, TechnicalError>>;

export declare function saveOnboarding(
  onboarding: Onboarding,
  context: Context,
): Future<Result<Onboarding, TechnicalError>>;
