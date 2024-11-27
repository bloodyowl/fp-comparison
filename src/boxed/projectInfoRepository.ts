import type { ProjectInfo } from "#app/boxed/finalizeOnboardingTypes.ts";
import type { TechnicalError } from "#app/shared/errors.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

export declare function findProjectInfo(
  projectId: string,
  language: Option<string>,
): Future<Result<ProjectInfo, TechnicalError>>;
