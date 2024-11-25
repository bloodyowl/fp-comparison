import type { Future, Option, Result } from "@swan-io/boxed";
import type { Context } from "../shared/context";
import type { TechnicalError } from "../shared/errors";
import type { Onboarding } from "./finalizeOnboardingTypes";

export declare function findById(
  onboardingId: string,
  context: Context,
): Future<Result<Option<Onboarding>, TechnicalError>>;

export declare function saveOnboarding(
  onboarding: Onboarding,
  context: Context,
): Future<Result<Onboarding, TechnicalError>>;
