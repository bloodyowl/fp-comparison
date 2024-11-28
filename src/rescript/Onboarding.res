type validationError = {
  errors: array<string>,
  field: string,
  path: string,
}

type statusInfo =
  | Finalized({finalizedAt: Date.t})
  | Valid
  | Invalid({errors: array<validationError>})

type oAuthRedirectParameters = {
  redirectUrl: option<string>,
  state: option<string>,
}

type id

type onboarding = {
  accountHolderId: option<AccountHolder.id>,
  accountId: option<Account.id>,
  accountName: option<string>,
  address1: option<string>,
  address2: option<string>,
  city: option<string>,
  country: option<string>,
  createdAt: Date.t,
}

type employmentStatus =
  | Craftsman
  | Employee
  | Entrepreneur
  | Farmer
  | Manager
  | Practitioner
  | Retiree
  | ShopOwner
  | Student
  | Unemployed

type monthlyIncome =
  | LessThan500
  | Between500And1500
  | Between1500And3000
  | Between3000And4500
  | MoreThan4500

type individualOnboarding = {
  ...onboarding,
  employmentStatus: option<employmentStatus>,
  monthlyIncome: option<monthlyIncome>,
}

type businessActivity =
  | Agriculture
  | ManufacturingAndMining
  | ElectricalDistributionAndWaterSupply
  | Construction
  | BusinessAndRetail
  | Transportation
  | LodgingAndFoodServices
  | InformationAndCommunication
  | FinancialAndInsuranceOperations
  | RealEstate
  | ScientificActivities
  | AdministrativeServices
  | PublicAdministration
  | Education
  | Health
  | Arts
  | Housekeeping
  | Other

type companyOnboarding = {
  ...onboarding,
  businessActivity: option<businessActivity>,
  businessActivityDescription: option<string>,
  companyRegistrationDate: option<Date.t>,
  isRegistered: option<bool>,
  legalForm: option<string>,
  name: option<string>,
  registrationNumber: option<string>,
  vatNumber: option<string>,
}

type onboardingInfo =
  | Individual(individualOnboarding)
  | Company(companyOnboarding)

type t = {
  id: id,
  email: option<string>,
  language: option<string>,
  statusInfo: statusInfo,
  projectId: Project.id,
  accountCountry: AccountCountry.t,
  info: onboardingInfo,
}

module Promise = {
  @val @module("Onboarding")
  external findById: (
    ~onboardingId: id,
    ~context: Context.t,
  ) => promise<result<option<t>, [> #TechnicalError]>> = "findById"

  @val @module("Onboarding")
  external save: (~onboarding: t, ~context: Context.t) => promise<result<t, [> #TechnicalError]>> =
    "saveOnboarding"

  @val @module("AccountService")
  external createAccountAndPersist: (
    ~onboarding: t,
    ~accountHolder: AccountHolder.t,
    ~accountNumber: string,
    ~tcuDocument: option<TCU.t>,
  ) => promise<
    result<
      Account.t,
      [> #TechnicalError | #InvalidPhoneNumberError | #MissingBirthDateRestrictionError],
    >,
  > = "createAndPersistAccount"
}

module Future = {
  @val @module("Onboarding")
  external findById: (
    ~onboardingId: id,
    ~context: Context.t,
  ) => Future.t<result<option<t>, [> #TechnicalError]>> = "findById"

  @val @module("Onboarding")
  external save: (~onboarding: t, ~context: Context.t) => Future.t<result<t, [> #TechnicalError]>> =
    "saveOnboarding"

  @val @module("AccountService")
  external createAccountAndPersist: (
    ~onboarding: t,
    ~accountHolder: AccountHolder.t,
    ~accountNumber: string,
    ~tcuDocument: option<TCU.t>,
  ) => Future.t<
    result<
      Account.t,
      [> #TechnicalError | #InvalidPhoneNumberError | #MissingBirthDateRestrictionError],
    >,
  > = "createAndPersistAccount"
}
