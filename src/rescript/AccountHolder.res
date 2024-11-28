type id

type t = {id: id, address1: string}

module Promise = {
  @val @module("AccountHolderRepository")
  external findByIdentityAndProject: (
    ~identityId: User.id,
    ~projectId: Project.id,
    ~context: Context.t,
  ) => promise<result<option<t>, [> #TechnicalError]>> = "findAccountHolderByIdentityAndProject"

  @val @module("AccountHolderRepository")
  external createByIdentityAndProject: (
    ~identityId: User.id,
    ~projectId: Project.id,
    ~context: Context.t,
  ) => promise<result<t, [> #TechnicalError]>> = "createAccountHolderByIdentityAndProject"
}

module Future = {
  @val @module("AccountHolderRepository")
  external findByIdentityAndProject: (
    ~identityId: User.id,
    ~projectId: Project.id,
    ~context: Context.t,
  ) => Future.t<result<option<t>, [> #TechnicalError]>> = "findAccountHolderByIdentityAndProject"

  @val @module("AccountHolderRepository")
  external createByIdentityAndProject: (
    ~identityId: User.id,
    ~projectId: Project.id,
    ~context: Context.t,
  ) => Future.t<result<t, [> #TechnicalError]>> = "createAccountHolderByIdentityAndProject"
}
