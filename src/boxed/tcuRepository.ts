import type {
  ActiveTCUDocumentNotFoundError,
  TechnicalError,
} from "#app/shared/errors.ts";
import type { TCUDocumentStatus } from "#app/shared/onboarding.ts";
import type { Future, Option, Result } from "@swan-io/boxed";

export type SwanTCUDocument = {
  createdAt: Date;
  documentId: string;
  id: string;
  updatedAt: Date;
  accountCountry: string;
  activatedAt: Option<Date>;
  activatingAt: Option<Date>;
  deactivatedAt: Option<Date>;
  deactivatingAt: Option<Date>;
  effectiveDate: Option<Date>;
  language: string;
  projectId: string;
  status: TCUDocumentStatus;
  type: "SwanTCU";
};

export declare function getActiveProjectTcus(
  projectId: string,
  accountCountry: string,
  language: string,
): Future<
  Result<SwanTCUDocument, TechnicalError | ActiveTCUDocumentNotFoundError>
>;
