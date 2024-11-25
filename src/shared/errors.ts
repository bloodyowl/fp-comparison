export type BaseFieldError = "Missing" | undefined;

export type BaseValidationError<E = BaseFieldError> = {
  errors: E[];
  field: string | number | symbol;
  path?: string;
};

export class TechnicalError extends Error {
  name = "TechnicalError";
}

export class OnboardingNotFoundError extends Error {
  name = "OnboardingNotFoundError";
}

export class OnboardingInvalidError extends Error {
  name = "OnboardingInvalidError";
}

export class OnboardingAlreadyFinalizedError extends Error {
  name = "OnboardingAlreadyFinalizedError";
}

export class ProjectSettingsNotFoundError extends Error {
  name = "ProjectSettingsNotFoundError";
}

export class ActiveTCUDocumentNotFoundError extends Error {
  name = "ActiveTCUDocumentNotFoundError";
}

export class InvalidPhoneNumberError extends Error {
  name = "InvalidPhoneNumberError";
}

export class MissingBirthDateRestrictionError extends Error {
  name = "MissingBirthDateRestrictionError";
}
