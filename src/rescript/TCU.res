type status =
  | Activating
  | Activated
  | Deactivating
  | Deactivated

type t = {
  createdAt: Date.t,
  documentId: string,
  id: string,
  updatedAt: Date.t,
  accountCountry: string,
  activatedAt: option<Date.t>,
  activatingAt: option<Date.t>,
  deactivatedAt: option<Date.t>,
  deactivatingAt: option<Date.t>,
  effectiveDate: option<Date.t>,
  language: string,
  projectId: string,
  status: status,
}

module Promise = {
  @val @module("TCU")
  external getActiveProjectTcus: (
    ~projectId: Project.id,
    ~accountCountry: AccountCountry.t,
    ~language: string,
  ) => promise<result<t, [> #TechnicalError | #ActiveTCUDocumentNotFoundError]>> =
    "getActiveProjectTcus"
}

module Future = {
  @val @module("TCU")
  external getActiveProjectTcus: (
    ~projectId: Project.id,
    ~accountCountry: AccountCountry.t,
    ~language: string,
  ) => Future.t<result<t, [> #TechnicalError | #ActiveTCUDocumentNotFoundError]>> =
    "getActiveProjectTcus"
}
