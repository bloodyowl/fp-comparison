import type { TechnicalError } from "#app/shared/errors.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

export type ProjectSettings = {
  arePublicOnboardingEnabled: boolean;
  enableB2BMembershipIdVerification: boolean;
  id: string;
  projectId: string;
};

export declare function findProjectSettings(
  projectId: string,
): Future<Result<Option<ProjectSettings>, TechnicalError>>;
