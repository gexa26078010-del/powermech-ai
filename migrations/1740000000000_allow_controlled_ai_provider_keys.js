const PROVIDER_CONSTRAINT = 'ai_gateway_invocations_provider_check';

exports.up = (pgm) => {
  pgm.dropConstraint('ai_gateway_invocations', PROVIDER_CONSTRAINT);
  pgm.addConstraint('ai_gateway_invocations', PROVIDER_CONSTRAINT, {
    check:
      "provider_key IN ('deterministic_stub', 'openai', 'invalid_configuration')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('ai_gateway_invocations', PROVIDER_CONSTRAINT);
  pgm.addConstraint('ai_gateway_invocations', PROVIDER_CONSTRAINT, {
    check: "provider_key = 'deterministic_stub'",
  });
};
