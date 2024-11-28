import {
  createAccountHolderByIdentityAndProject,
  findAccountHolderByIdentityAndProject,
} from "#app/effect/accountHolderRepository.ts";
import { createAccountMembership } from "#app/effect/accountMembershipRepository.ts";
import { generateAccountNumber } from "#app/effect/accountNumber.ts";
import {
  createAndPersistAccount,
  createIban,
} from "#app/effect/accountService.ts";
import type {
  FinalizeOnboardingInput,
  Identity,
  Onboarding,
} from "#app/effect/finalizeOnboardingTypes.ts";
import { findById, saveOnboarding } from "#app/effect/onboardingRepository.ts";
import {
  getActiveProjectTcus,
  type SwanTCUDocument,
} from "#app/effect/tcuRepository.ts";
import type { Context } from "#app/shared/context.ts";
import {
  OnboardingAlreadyFinalizedError,
  OnboardingInvalidError,
  OnboardingNotFoundError,
} from "#app/shared/errors.ts";
import { Effect, Match, Option, pipe } from "effect";
import type { Option as OptionT } from "effect/Option";
import { match } from "ts-pattern";

const getValidOnboarding = (onboardingId: string, context: Context) => {
  return findById(onboardingId, context).pipe(
    Effect.flatMap(
      Option.match({
        onNone: () => Effect.fail(new OnboardingNotFoundError(onboardingId)),
        onSome: (onboarding) =>
          Match.value(onboarding).pipe(
            Match.when({ statusInfo: { status: "Finalized" } }, () =>
              Effect.fail(new OnboardingAlreadyFinalizedError(onboardingId)),
            ),
            Match.when({ statusInfo: { status: "Invalid" } }, () =>
              Effect.fail(new OnboardingInvalidError(onboardingId)),
            ),
            Match.when({ statusInfo: { status: "Valid" } }, (onboarding) =>
              Effect.succeed(onboarding),
            ),
            Match.orElseAbsurd,
          ),
      }),
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
          Effect.flatMap(
            Option.match({
              onNone: () =>
                createAccountHolderByIdentityAndProject(
                  identity.identityId,
                  onboarding.projectId,
                  context,
                ),
              onSome: Effect.succeed,
            }),
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
    projectTcus: OptionT<SwanTCUDocument>;
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

  const account = Effect.all({
    accountHolder,
    accountNumber,
  }).pipe(
    Effect.flatMap(({ accountHolder, accountNumber }) =>
      createAndPersistAccount(
        onboarding,
        accountHolder,
        accountNumber,
        projectTcus,
      ),
    ),
  );

  const ibanEntry = account.pipe(
    Effect.flatMap((account) =>
      createIban({
        accountId: account.id,
        accountNumber: account.accountNumber,
        country: account.country,
        projectId: account.projectId,
        type: "Main",
      }),
    ),
  );

  return Effect.all({ account, ibanEntry }).pipe(
    Effect.map(({ account }) => account),
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

  const projectTcus = onboarding.pipe(
    Effect.flatMap((onboarding) =>
      getActiveProjectTcus(
        onboarding.projectId,
        onboarding.accountCountry,
        pipe(
          onboarding.language,
          Option.getOrElse(() => "en"),
        ),
      ),
    ),
    Effect.match({
      onFailure: Option.none,
      onSuccess: Option.some,
    }),
  );

  const account = Effect.all({
    onboarding,
    projectTcus,
  }).pipe(
    Effect.flatMap(({ onboarding, projectTcus }) =>
      openAccount({ onboarding, projectTcus, identity }, context),
    ),
  );

  const legalRepresentativeMembership = account.pipe(
    Effect.flatMap((account) =>
      createLegalRepresentativeMembership({
        accountId: account.id,
        userId: context.userId,
      }),
    ),
  );

  return Effect.all({
    onboarding,
    account,
    legalRepresentativeMembership,
  }).pipe(
    Effect.flatMap(({ onboarding }) =>
      saveOnboarding(
        {
          ...onboarding,
          finalizedAt: Option.some(new Date()),
        },
        context,
      ),
    ),
  );
};
