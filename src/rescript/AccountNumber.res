module Promise = {
  @val @module("AccountMembership")
  external generateAccountNumber: (
    ~ibanType: IBAN.ibanType,
    ~country: AccountCountry.t,
  ) => promise<result<string, [> #TechnicalError]>> = "createAccountMembership"
}

module Future = {
  @val @module("AccountMembership")
  external generateAccountNumber: (
    ~ibanType: IBAN.ibanType,
    ~country: AccountCountry.t,
  ) => Future.t<result<string, [> #TechnicalError]>> = "createAccountMembership"
}
