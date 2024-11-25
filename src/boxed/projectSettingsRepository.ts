import type { Future, Option, Result } from "@swan-io/boxed";
import type { TechnicalError } from "../shared/errors";

export type ProjectSettings = {
  arePublicOnboardingEnabled: boolean;
  enableB2BMembershipIdVerification: boolean;
  id: string;
  projectId: string;
};

export declare function findProjectSettings(
  projectId: string,
): Future<Result<Option<ProjectSettings>, TechnicalError>>;
