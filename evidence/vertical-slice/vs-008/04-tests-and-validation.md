# VS-008 Evidence: 04 - Tests and Validation

## Added tests

Provider selection tests cover:

- implicit deterministic default
- explicit deterministic mode without a secret
- OpenAI selection with complete configuration
- missing OpenAI key
- unsupported provider value

OpenAI adapter tests cover:

- native-fetch request shape
- strict JSON Schema configuration
- `store: false`
- safe non-success status handling
- missing structured output
- no network call with incomplete configuration

Controlled output tests cover:

- exact valid shape
- mandatory human verification
- prohibited final diagnosis
- prohibited repair approval
- rejection of extra free-form fields
- malformed next checks

AI Gateway tests cover:

- failed-configuration audit rows
- invalid-configuration audit rows
- dynamic `realProviderUsed`
- invalid-provider-output audit and rejection
- unchanged deterministic behavior

## Repository enforcement

The validator checks required VS-008 artifacts, deterministic default configuration, adapter contract fragments, native fetch without SDK, missing direct Repair Mentor provider access, forbidden dependencies/modules, provider audit migration, empty key placeholder, and absence of secret-looking values.
