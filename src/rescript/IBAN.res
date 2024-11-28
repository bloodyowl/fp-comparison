type id

type ibanType = Main | Virtual

type t = {
  id: id,
  ibanType: ibanType,
  accountId: Account.id,
  bic: string,
  blockSDD: bool,
  createdAt: Date.t,
  iban: string,
  label: string,
  projectId: string,
  status: string,
  updatedAt: Date.t,
}

module Promise = {
  @val @module("IBAN")
  external create: (
    ~accountId: Account.id,
    ~accountNumber: string,
    ~country: string,
    ~projectId: Project.id,
    ~ibanType: ibanType,
  ) => promise<result<t, [> #TechnicalError]>> = "createIban"
}

module Future = {
  @val @module("IBAN")
  external create: (
    ~accountId: Account.id,
    ~accountNumber: string,
    ~country: string,
    ~projectId: Project.id,
    ~ibanType: ibanType,
  ) => Future.t<result<t, [> #TechnicalError]>> = "createIban"
}
