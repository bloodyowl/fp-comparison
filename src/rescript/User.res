type id

type identificationLevel = Expert | QES | PVID

type t = {
  id: id,
  identityId: id,
  birthDate: Date.t,
  firstName: string,
  identificationLevels: array<identificationLevel>,
  lastName: string,
  phoneNumber: string,
}
