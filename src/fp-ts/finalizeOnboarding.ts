import {
  createAccountHolderByIdentityAndProject,
  findAccountHolderByIdentityAndProject,
} from "#app/fp-ts/accountHolderRepository.ts";
import { createAccountMembership } from "#app/fp-ts/accountMembershipRepository.ts";
import { generateAccountNumber } from "#app/fp-ts/accountNumber.ts";
import {
  createAndPersistAccount,
  createIban,
} from "#app/fp-ts/accountService.ts";
import type {
  FinalizeOnboardingInput,
  Identity,
  Onboarding,
} from "#app/fp-ts/finalizeOnboardingTypes.ts";
import { findById, saveOnboarding } from "#app/fp-ts/onboardingRepository.ts";
import {
  getActiveProjectTcus,
  type SwanTCUDocument,
} from "#app/fp-ts/tcuRepository.ts";
import type { Context } from "#app/shared/context.ts";
import {
  OnboardingAlreadyFinalizedError,
  OnboardingInvalidError,
  OnboardingNotFoundError,
} from "#app/shared/errors.ts";
import { option, task, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import type { Option } from "fp-ts/Option";
import { match } from "ts-pattern";

const getValidOnboarding = (onboardingId: string, context: Context) => {
  return pipe(
    findById(onboardingId, context),
    taskEither.flatMap(
      option.fold(
        () => taskEither.left(new OnboardingNotFoundError(onboardingId)),
        (onboarding) =>
          match(onboarding)
            .with({ statusInfo: { status: "Finalized" } }, () =>
              taskEither.left(
                new OnboardingAlreadyFinalizedError(onboardingId),
              ),
            )
            .with({ statusInfo: { status: "Invalid" } }, () =>
              taskEither.left(new OnboardingInvalidError(onboardingId)),
            )
            .with({ statusInfo: { status: "Valid" } }, (onboarding) =>
              taskEither.right(onboarding),
            )
            .exhaustive(),
      ),
    ),
  );
};

const getOrCreateAccountHolder = (
  {
    onboarding,
    identity,
  }: {
    onboarding: Onboarding & { statusInfo: { status: "Valid" } };
    identity: Identity;
  },
  context: Context,
) => {
  return (
    match(onboarding)
      // Individual holder can be commonized as user is a strong enough identifier
      .with({ type: "Individual" }, (onboarding) => {
        return pipe(
          findAccountHolderByIdentityAndProject(
            identity.identityId,
            onboarding.projectId,
            context,
          ),
          taskEither.flatMap(
            option.fold(
              () =>
                createAccountHolderByIdentityAndProject(
                  identity.identityId,
                  onboarding.projectId,
                  context,
                ),
              taskEither.right,
            ),
          ),
        );
      })
      // For companies, we create one, and possibly duplicate
      .with({ type: "Company" }, (onboarding) => {
        return createAccountHolderByIdentityAndProject(
          identity.identityId,
          onboarding.projectId,
          context,
        );
      })
      .exhaustive()
  );
};

const openAccount = (
  {
    onboarding,
    identity,
    projectTcus,
  }: {
    onboarding: Onboarding & { statusInfo: { status: "Valid" } };
    identity: Identity;
    projectTcus: Option<SwanTCUDocument>;
  },
  context: Context,
) => {
  const accountHolder = getOrCreateAccountHolder(
    { onboarding, identity },
    context,
  );

  const accountNumber = generateAccountNumber(
    "Main",
    onboarding.accountCountry,
  );

  const account = pipe(
    taskEither.Do,
    taskEither.apS("accountHolder", accountHolder),
    taskEither.apS("accountNumber", accountNumber),
    taskEither.flatMap(({ accountHolder, accountNumber }) =>
      createAndPersistAccount(
        onboarding,
        accountHolder,
        accountNumber,
        projectTcus,
      ),
    ),
  );

  const ibanEntry = pipe(
    account,
    taskEither.flatMap((account) =>
      createIban({
        accountId: account.id,
        accountNumber: account.accountNumber,
        country: account.country,
        projectId: account.projectId,
        type: "Main",
      }),
    ),
  );

  return pipe(
    taskEither.Do,
    taskEither.apFirst(ibanEntry),
    taskEither.apSecond(account),
  );
};

const createLegalRepresentativeMembership = ({
  userId,
  accountId,
}: {
  accountId: string;
  userId: string;
}) => {
  return createAccountMembership({
    id: crypto.randomUUID(),
    accountId,
    permissions: {
      canViewAccount: true,
      canInitiatePayments: true,
      canManageAccountMembership: true,
      canManageBeneficiaries: true,
      canManageCards: true,
    },
    isLegalRepresentative: true,
    statusInfo: {
      status: "Enabled",
      userId,
    },
  });
};

export const finalizeOnboarding = (
  { identity, onboardingId }: FinalizeOnboardingInput,
  context: Context,
) => {
  const onboarding = getValidOnboarding(onboardingId, context);

  const projectTcus = pipe(
    onboarding,
    taskEither.flatMap((onboarding) =>
      getActiveProjectTcus(
        onboarding.projectId,
        onboarding.accountCountry,
        pipe(
          onboarding.language,
          option.getOrElse(() => "en"),
        ),
      ),
    ),
    task.map(option.fromEither),
    taskEither.fromTask,
  );

  const account = pipe(
    taskEither.Do,
    taskEither.apSW("onboarding", onboarding),
    taskEither.apSW("projectTcus", projectTcus),
    taskEither.flatMap(({ onboarding, projectTcus }) =>
      openAccount({ onboarding, projectTcus, identity }, context),
    ),
  );

  const legalRepresentativeMembership = pipe(
    account,
    taskEither.flatMap((account) =>
      createLegalRepresentativeMembership({
        accountId: account.id,
        userId: context.userId,
      }),
    ),
  );

  return pipe(
    taskEither.Do,
    taskEither.apS("onboarding", onboarding),
    taskEither.apS("account", account),
    taskEither.apS(
      "legalRepresentativeMembership",
      legalRepresentativeMembership,
    ),
    taskEither.flatMap(({ onboarding }) =>
      saveOnboarding(
        {
          ...onboarding,
          finalizedAt: option.some(new Date()),
        },
        context,
      ),
    ),
  );
};
