import type { BaseValidationError } from "#app/shared/errors.ts";
import type {
  AccountCountry,
  BusinessActivity,
  CapitalDepositType,
  EmploymentStatus,
  MonthlyIncome,
  OnboardingScope,
  OnboardingStatus,
  VerificationFlow,
} from "#app/shared/onboarding.ts";
import type { Option } from "fp-ts/Option";

export type IdentificationLevel = "Expert" | "QES" | "PVID";

export type Identity = {
  birthDate: Date;
  firstName: string;
  identificationLevels: Option<IdentificationLevel[]>;
  identityId: string;
  lastName: string;
  phoneNumber: string;
};

export type FinalizeOnboardingInput = {
  identity: Identity;
  onboardingId: string;
};

type OnboardingValidationError = BaseValidationError;

type OnboardingStatusInfo = {
  errors?: OnboardingValidationError[];
  status: OnboardingStatus;
};

type State = Option<string>;

type RedirectUrl = Option<string>;

export type OAuthRedirectParameters = {
  redirectUrl: RedirectUrl;
  state: State;
};

export type GenericOnboarding = {
  accountCountry: AccountCountry;
  accountHolderId: Option<string>;
  accountId: Option<string>;
  accountName: Option<string>;
  address1: Option<string>;
  address2: Option<string>;
  city: Option<string>;
  country: Option<string>;
  createdAt: Date;
  email: Option<string>;
  finalizedAt: Option<Date>;
  id: string;
  capitalDepositType: Option<CapitalDepositType>;
  language: Option<string>;
  legalRepresentativeAcceptedIdentificationLevels: Array<IdentificationLevel>;
  legalRepresentativeRecommendedIdentificationLevel: IdentificationLevel;
  oAuthRedirectParameters: Option<OAuthRedirectParameters>;
  onboardingUrl: Option<string>;
  projectId: string;
  redirectUrl: Option<string>;
  scope: OnboardingScope;
  state: Option<string>;
  statusInfo: OnboardingStatusInfo;
  supportingDocumentCollectionId: string;
  taxIdentificationNumber: Option<string>;
  type: "Individual" | "Company";
  updatedAt: Date;
  verificationFlow: VerificationFlow;
  wipedAt: Date;
  zipCode: Option<string>;
};

export type IndividualOnboarding = GenericOnboarding & {
  employmentStatus: Option<EmploymentStatus>;
  monthlyIncome: Option<MonthlyIncome>;
  type: "Individual";
};

export type CompanyOnboarding = GenericOnboarding & {
  businessActivity: Option<BusinessActivity>;
  businessActivityDescription: Option<string>;
  companyRegistrationDate: Option<Date>;
  isRegistered: Option<boolean>;
  legalForm: Option<string>;
  name: Option<string>;
  registrationNumber: Option<string>;
  type: "Company";
  vatNumber: Option<string>;
};

export type Onboarding = IndividualOnboarding | CompanyOnboarding;

export type ProjectStatus = "Active" | "Inactive";

export type ProjectInfo = {
  accentColor: Option<string>;
  logoUri: Option<string>;
  name: string;
  status: ProjectStatus;
  tcuDocumentUri: string;
};
