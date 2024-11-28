type id
type t = {
  arePublicOnboardingEnabled: bool,
  enableB2BMembershipIdVerification: bool,
  id: id,
  projectId: Project.id,
}

module Promise = {
  @val @module("ProjectSettings")
  external find: (~projectId: Project.id) => promise<result<option<t>, [#TechnicalError]>> =
    "findProjectSettings"
}

module Future = {
  @val @module("ProjectSettings")
  external find: (~projectId: Project.id) => Future.t<result<option<t>, [#TechnicalError]>> =
    "findProjectSettings"
}
