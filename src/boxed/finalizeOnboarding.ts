import {
  createAccountHolderByIdentityAndProject,
  findAccountHolderByIdentityAndProject,
} from "#app/boxed/accountHolderRepository.ts";
import { createAccountMembership } from "#app/boxed/accountMembershipRepository.ts";
import { generateAccountNumber } from "#app/boxed/accountNumber.ts";
import {
  createAndPersistAccount,
  createIban,
} from "#app/boxed/accountService.ts";
import type {
  FinalizeOnboardingInput,
  Identity,
  Onboarding,
} from "#app/boxed/finalizeOnboardingTypes.ts";
import { findById, saveOnboarding } from "#app/boxed/onboardingRepository.ts";
import {
  getActiveProjectTcus,
  type SwanTCUDocument,
} from "#app/boxed/tcuRepository.ts";
import type { Context } from "#app/shared/context.ts";
import {
  OnboardingAlreadyFinalizedError,
  OnboardingInvalidError,
  OnboardingNotFoundError,
} from "#app/shared/errors.ts";
import { Future, Option, Result } from "@swan-io/boxed";
import { match, P } from "ts-pattern";

const getValidOnboarding = (onboardingId: string, context: Context) => {
  return findById(onboardingId, context).mapOkToResult((onboarding) =>
    match(onboarding)
      .with(Option.P.None, () =>
        Result.Error(new OnboardingNotFoundError(onboardingId)),
      )
      .with(Option.P.Some({ statusInfo: { status: "Finalized" } }), () =>
        Result.Error(new OnboardingAlreadyFinalizedError(onboardingId)),
      )
      .with(Option.P.Some({ statusInfo: { status: "Invalid" } }), () =>
        Result.Error(new OnboardingInvalidError(onboardingId)),
      )
      .with(
        Option.P.Some(P.select({ statusInfo: { status: "Valid" } })),
        (onboarding) => Result.Ok(onboarding),
      )
      .exhaustive(),
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
        return findAccountHolderByIdentityAndProject(
          identity.identityId,
          onboarding.projectId,
          context,
        ).flatMapOk((accountHolder) => {
          if (accountHolder.isSome()) {
            return Future.value(Result.Ok(accountHolder.get()));
          }
          return createAccountHolderByIdentityAndProject(
            identity.identityId,
            onboarding.projectId,
            context,
          );
        });
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

  const account = Future.allFromDict({ accountHolder, accountNumber })
    .map(Result.allFromDict)
    .flatMapOk(({ accountHolder, accountNumber }) =>
      createAndPersistAccount(
        onboarding,
        accountHolder,
        accountNumber,
        projectTcus,
      ),
    );

  const ibanEntry = account.flatMapOk((account) =>
    createIban({
      accountId: account.id,
      accountNumber: account.accountNumber,
      country: account.country,
      projectId: account.projectId,
      type: "Main",
    }),
  );

  return Future.allFromDict({ account, ibanEntry })
    .map(Result.allFromDict)
    .mapOk(({ account }) => account);
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

  const projectTcus = onboarding.flatMapOk((onboarding) =>
    getActiveProjectTcus(
      onboarding.projectId,
      onboarding.accountCountry,
      onboarding.language.getOr("en"),
    ),
  );

  const account = Future.allFromDict({ onboarding, projectTcus })
    .map(({ onboarding, projectTcus }) =>
      onboarding.map((onboarding) => ({
        onboarding,
        projectTcus: projectTcus.toOption(),
      })),
    )
    .flatMapOk(({ onboarding, projectTcus }) =>
      openAccount({ onboarding, projectTcus, identity }, context),
    );

  const legalRepresentativeMembership = account.flatMapOk((account) =>
    createLegalRepresentativeMembership({
      accountId: account.id,
      userId: context.userId,
    }),
  );

  return Future.allFromDict({
    onboarding,
    account,
    legalRepresentativeMembership,
  })
    .map(Result.allFromDict)
    .flatMapOk(({ onboarding }) =>
      saveOnboarding(
        {
          ...onboarding,
          finalizedAt: Option.Some(new Date()),
        },
        context,
      ),
    );
};
