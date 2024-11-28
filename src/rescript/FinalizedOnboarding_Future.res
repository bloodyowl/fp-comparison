let getValidOnboarding = (~onboardingId: Onboarding.id, ~context: Context.t) => {
  Onboarding.Future.findById(~onboardingId, ~context)->Future.mapResult(onboarding =>
    switch onboarding {
    | None => Error(#OnboardingNotFoundError(onboardingId))
    | Some({statusInfo: Finalized(_)}) => Error(#OnboardingAlreadyFinalizedError(onboardingId))
    | Some({statusInfo: Invalid(_)}) => Error(#OnboardingInvalidError(onboardingId))
    | Some({statusInfo: Valid} as onboarding) => Ok(onboarding)
    }
  )
}

let getOrCreateAccountHolder = (
  ~onboarding: Onboarding.t,
  ~user as {identityId}: User.t,
  ~context: Context.t,
) => {
  switch onboarding {
  | {info: Individual(_), projectId} =>
    AccountHolder.Future.findByIdentityAndProject(
      ~identityId,
      ~projectId,
      ~context,
    )->Future.flatMapOk(existingAccountHolder =>
      switch existingAccountHolder {
      | Some(accountHolder) => Future.value(Ok(accountHolder))
      | None => AccountHolder.Future.createByIdentityAndProject(~identityId, ~projectId, ~context)
      }
    )
  | {info: Company(_), projectId} =>
    AccountHolder.Future.createByIdentityAndProject(~identityId, ~projectId, ~context)
  }
}

let openAccount = (
  ~onboarding: Onboarding.t,
  ~user: User.t,
  ~tcuDocument: option<TCU.t>,
  ~context: Context.t,
) => {
  let accountHolder = getOrCreateAccountHolder(~onboarding, ~user, ~context)
  let accountNumber = AccountNumber.Future.generateAccountNumber(
    ~ibanType=Main,
    ~country=onboarding.accountCountry,
  )

  let account = Future.all2((accountHolder, accountNumber))->Future.flatMap(((
    accountHolder,
    accountNumber,
  )) => {
    switch (accountHolder, accountNumber) {
    | (Ok(accountHolder), Ok(accountNumber)) =>
      Onboarding.Future.createAccountAndPersist(
        ~onboarding,
        ~accountHolder,
        ~accountNumber,
        ~tcuDocument,
      )
    | (Error(_) as error, _) | (_, Error(_) as error) => Future.value(error)
    }
  })

  let ibanEntry = Future.all2((account, accountNumber))->Future.flatMap(((
    account,
    accountNumber,
  )) =>
    switch (account, accountNumber) {
    | (Ok(account), Ok(accountNumber)) =>
      IBAN.Future.create(
        ~accountId=account.id,
        ~accountNumber,
        ~country=account.country,
        ~projectId=account.projectId,
        ~ibanType=Main,
      )->Future.mapOk(_ => account)
    | (Error(_) as error, _) | (_, Error(_) as error) => Future.value(error)
    }
  )

  Future.all2((account, ibanEntry))->Future.map(((account, ibanEntry)) =>
    switch (account, ibanEntry) {
    | (Ok(_) as account, Ok(_)) => account
    | (Error(_) as error, _) | (_, Error(_) as error) => error
    }
  )
}

let createLegalRepresentativeMembership = (~userId: User.id, ~accountId: Account.id) => {
  AccountMembership.Future.create(
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

let finalizeOnboarding = (~user: User.t, ~onboardingId: Onboarding.id, ~context: Context.t) => {
  let onboarding = getValidOnboarding(~onboardingId, ~context)

  let projectTcus =
    onboarding
    ->Future.flatMapOk(onboarding =>
      TCU.Future.getActiveProjectTcus(
        ~projectId=onboarding.projectId,
        ~accountCountry=onboarding.accountCountry,
        ~language=onboarding.language->Option.getOr("en"),
      )
    )
    ->Future.map(projectTcus =>
      switch projectTcus {
      | Ok(projectTcus) => Some(projectTcus)
      | Error(_) => None
      }
    )

  let account = Future.all2((onboarding, projectTcus))->Future.flatMap(((
    onboarding,
    tcuDocument,
  )) =>
    switch onboarding {
    | Ok(onboarding) => openAccount(~onboarding, ~tcuDocument, ~user, ~context)
    | Error(_) as error => Future.value(error)
    }
  )

  let legalRepresentativeMembership =
    account->Future.flatMapOk(account =>
      createLegalRepresentativeMembership(~accountId=account.id, ~userId=user.id)
    )

  Future.all3((onboarding, account, legalRepresentativeMembership))->Future.flatMap(((
    onboarding,
    account,
    legalRepresentativeMembership,
  )) =>
    switch (onboarding, account, legalRepresentativeMembership) {
    | (Ok(onboarding), Ok(_), Ok(_)) =>
      Onboarding.Future.save(
        ~onboarding={
          ...onboarding,
          statusInfo: Finalized({finalizedAt: Date.make()}),
        },
        ~context,
      )
    | (Error(_) as error, _, _) | (_, Error(_) as error, _) | (_, _, Error(_) as error) =>
      Future.value(error)
    }
  )
}
