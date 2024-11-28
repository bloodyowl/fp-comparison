import type { Context } from "#app/shared/context.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Effect } from "effect/Effect";
import type { Option } from "effect/Option";
import type { Onboarding } from "./finalizeOnboardingTypes";

export declare function findById(
  onboardingId: string,
  context: Context,
): Effect<Option<Onboarding>, TechnicalError>;

export declare function saveOnboarding(
  onboarding: Onboarding,
  context: Context,
): Effect<Onboarding, TechnicalError>;
