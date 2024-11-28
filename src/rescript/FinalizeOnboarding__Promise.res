let getValidOnboarding = async (~onboardingId: Onboarding.id, ~context: Context.t) => {
  let onboarding = await Onboarding.Promise.findById(~onboardingId, ~context)
  switch onboarding {
  | Ok(None) => Error(#OnboardingNotFoundError(onboardingId))
  | Ok(Some({statusInfo: Finalized(_)})) => Error(#OnboardingAlreadyFinalizedError(onboardingId))
  | Ok(Some({statusInfo: Invalid(_)})) => Error(#OnboardingInvalidError(onboardingId))
  | Ok(Some({statusInfo: Valid} as onboarding)) => Ok(onboarding)
  | Error(value) => Error(value)
  }
}

let getOrCreateAccountHolder = async (
  ~onboarding: Onboarding.t,
  ~user as {identityId}: User.t,
  ~context: Context.t,
) => {
  switch onboarding {
  | {info: Individual(_), projectId} =>
    let existingAccountHolder = await AccountHolder.Promise.findByIdentityAndProject(
      ~identityId,
      ~projectId,
      ~context,
    )
    switch existingAccountHolder {
    | Ok(Some(accountHolder)) => Ok(accountHolder)
    | Ok(None) =>
      await AccountHolder.Promise.createByIdentityAndProject(~identityId, ~projectId, ~context)
    | Error(_) as other => other
    }
  | {info: Company(_), projectId} =>
    await AccountHolder.Promise.createByIdentityAndProject(~identityId, ~projectId, ~context)
  }
}

let openAccount = async (
  ~onboarding: Onboarding.t,
  ~user: User.t,
  ~tcuDocument: option<TCU.t>,
  ~context: Context.t,
) => {
  let accountHolder = getOrCreateAccountHolder(~onboarding, ~user, ~context)
  let accountNumber = AccountNumber.Promise.generateAccountNumber(
    ~ibanType=Main,
    ~country=onboarding.accountCountry,
  )

  let (accountHolder, accountNumber) = await Promise.all2((accountHolder, accountNumber))

  let account = switch (accountHolder, accountNumber) {
  | (Ok(accountHolder), Ok(accountNumber)) =>
    await Onboarding.Promise.createAccountAndPersist(
      ~onboarding,
      ~accountHolder,
      ~accountNumber,
      ~tcuDocument,
    )
  | (Error(_) as error, _) | (_, Error(_) as error) => error
  }

  let ibanEntry = switch (account, accountNumber) {
  | (Ok(account), Ok(accountNumber)) =>
    await IBAN.Promise.create(
      ~accountId=account.id,
      ~accountNumber,
      ~country=account.country,
      ~projectId=account.projectId,
      ~ibanType=Main,
    )
  | (Error(_) as error, _) | (_, Error(_) as error) => error
  }

  ibanEntry->Result.flatMap(_ => account)
}

let createLegalRepresentativeMembership = (~userId: User.id, ~accountId: Account.id) => {
  AccountMembership.Promise.create(
    ~accountMembership={
      id: AccountMembership.Id.make(),
      accountId,
      permissions: {
        canViewAccount: true,
        canInitiatePayments: true,
        canManageAccountMembership: true,
        canManageBeneficiaries: true,
        canManageCards: true,
      },
      isLegalRepresentative: true,
      statusInfo: #Enabled(userId),
    },
  )
}

let finalizeOnboarding = async (
  ~user: User.t,
  ~onboardingId: Onboarding.id,
  ~context: Context.t,
) => {
  let onboarding = await getValidOnboarding(~onboardingId, ~context)

  let projectTcus = switch onboarding {
  | Ok(onboarding) =>
    let projectTcus = await TCU.Promise.getActiveProjectTcus(
      ~projectId=onboarding.projectId,
      ~accountCountry=onboarding.accountCountry,
      ~language=onboarding.language->Option.getOr("en"),
    )
    switch projectTcus {
    | Ok(projectTcus) => Ok(Some(projectTcus))
    | Error(_) => Ok(None)
    }
  | Error(_) as error => error
  }

  let account = switch (onboarding, projectTcus) {
  | (Ok(onboarding), Ok(tcuDocument)) =>
    await openAccount(~onboarding, ~tcuDocument, ~user, ~context)
  | (Error(_) as error, _) | (_, Error(_) as error) => error
  }

  let legalRepresentativeMembership = switch account {
  | Ok(account) => await createLegalRepresentativeMembership(~accountId=account.id, ~userId=user.id)
  | Error(_) as error => error
  }

  switch (onboarding, account, legalRepresentativeMembership) {
  | (Ok(onboarding), Ok(_), Ok(_)) =>
    await Onboarding.Promise.save(
      ~onboarding={
        ...onboarding,
        statusInfo: Finalized({finalizedAt: Date.make()}),
      },
      ~context,
    )
  | (Error(_) as error, _, _) | (_, Error(_) as error, _) | (_, _, Error(_) as error) => error
  }
}
