import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Option } from "fp-ts/Option";
import type { TaskEither } from "fp-ts/TaskEither";
import type { Onboarding } from "./finalizeOnboardingTypes";

export declare function findById(
  onboardingId: string,
  context: Context,
): TaskEither<TechnicalError, Option<Onboarding>>;

export declare function saveOnboarding(
  onboarding: Onboarding,
  context: Context,
): TaskEither<TechnicalError, Onboarding>;
