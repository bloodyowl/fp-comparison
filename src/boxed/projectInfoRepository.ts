import type { Future, Option, Result } from "@swan-io/boxed";
import type { TechnicalError } from "../shared/errors";
import type { ProjectInfo } from "./finalizeOnboardingTypes";

export declare function findProjectInfo(
  projectId: string,
  language: Option<string>,
): Future<Result<ProjectInfo, TechnicalError>>;
