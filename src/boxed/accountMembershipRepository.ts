import type { TechnicalError } from "#app/shared/errors.ts";
import { Future, type Result } from "@swan-io/boxed";

export type AccountMembershipRestrictedTo = {
  firstName: string;
  lastName: string;
};

type AccountMembershipActiveStatus =
  | { status: "ConsentPending"; restrictedTo: AccountMembershipRestrictedTo }
  | { status: "InvitationSent"; restrictedTo: AccountMembershipRestrictedTo }
  | {
      status: "BindingUserError";
      userId: string;
      restrictedTo: AccountMembershipRestrictedTo;
    }
  | { status: "Enabled"; userId: string };

export type AccountMembershipStatusInfo =
  | AccountMembershipActiveStatus
  | { status: "Suspended"; previousStatus: AccountMembershipActiveStatus }
  | { status: "Disabled"; previousStatus: AccountMembershipActiveStatus };

export type AccountMembership = {
  id: string;
  accountId: string;
  permissions: {
    canManageCards: boolean;
    canInitiatePayments: boolean;
    canManageAccountMembership: boolean;
    canManageBeneficiaries: boolean;
    canViewAccount: boolean;
  };
  isLegalRepresentative: boolean;
  statusInfo: AccountMembershipStatusInfo;
};

export declare function createAccountMembership(
  accountMembership: AccountMembership
): Future<Result<AccountMembership, TechnicalError>>;
