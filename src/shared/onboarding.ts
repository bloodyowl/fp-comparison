export type OnboardingStatus = "Invalid" | "Valid" | "Finalized";

export const accountCountries = ["FRA", "DEU", "ESP", "NLD", "ITA"] as const;

export type AccountCountry = (typeof accountCountries)[number];

export const capitalDepositTypesEnum = [
  "MainCompanyAccount",
  "ShareholderAccount",
] as const;

export type CapitalDepositType = (typeof capitalDepositTypesEnum)[number];

export type OnboardingScope = "private" | "projectOwner" | "public";

export type VerificationFlow = "Upfront" | "Progressive";

export type EmploymentStatus =
  | "Craftsman"
  | "Employee"
  | "Entrepreneur"
  | "Farmer"
  | "Manager"
  | "Practitioner"
  | "Retiree"
  | "ShopOwner"
  | "Student"
  | "Unemployed";

export type MonthlyIncome =
  | "LessThan500"
  | "Between500And1500"
  | "Between1500And3000"
  | "Between3000And4500"
  | "MoreThan4500";

const businessActivities = [
  "Agriculture",
  "ManufacturingAndMining",
  "ElectricalDistributionAndWaterSupply",
  "Construction",
  "BusinessAndRetail",
  "Transportation",
  "LodgingAndFoodServices",
  "InformationAndCommunication",
  "FinancialAndInsuranceOperations",
  "RealEstate",
  "ScientificActivities",
  "AdministrativeServices",
  "PublicAdministration",
  "Education",
  "Health",
  "Arts",
  "Housekeeping",
  "Other",
] as const;

export type BusinessActivity = (typeof businessActivities)[number];

export type TCUDocumentStatus =
  | "Activating"
  | "Activated"
  | "Deactivating"
  | "Deactivated";
