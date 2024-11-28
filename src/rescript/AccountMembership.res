type restrictedTo = {
  firstName: string,
  lastName: string,
}

type bindingUserErrorStatusInfo = {userId: User.id, restrictedTo: restrictedTo}

type activeStatus = [
  | #ConsentPending(restrictedTo)
  | #InvitationSent(restrictedTo)
  | #BindingUserError(bindingUserErrorStatusInfo)
  | #Enabled(User.id)
]

type inactiveStatusInfo = {previousStatus: activeStatus}

type statusInfo = [
  | activeStatus
  | #Suspended(inactiveStatusInfo)
  | #Disabled(inactiveStatusInfo)
]

type id

module Id = {
  @val @scope("Crypto") external make: unit => id = "randomUUID"
}

type permissions = {
  canManageCards: bool,
  canInitiatePayments: bool,
  canManageAccountMembership: bool,
  canManageBeneficiaries: bool,
  canViewAccount: bool,
}

type t = {
  id: id,
  accountId: Account.id,
  permissions: permissions,
  isLegalRepresentative: bool,
  statusInfo: statusInfo,
}

module Promise = {
  @val @module("AccountMembership")
  external create: (~accountMembership: t) => promise<result<t, [> #TechnicalError]>> =
    "createAccountMembership"
}

module Future = {
  @val @module("AccountMembership")
  external create: (~accountMembership: t) => Future.t<result<t, [> #TechnicalError]>> =
    "createAccountMembership"
}
