import { validateControlledRepairMentorOutput } from './controlled-repair-mentor-output.validator';

const validOutput = () => ({
  summary: 'Recorded context supports two controlled next checks.',
  nextChecks: [
    {
      checkKey: 'fuel_pump_prime_confirm',
      title: 'Confirm fuel pump prime',
      reason: 'Fuel pump prime remains unknown.',
      priority: 1,
    },
  ],
  safetyWarnings: ['Follow the service procedure and normal safety controls.'],
  limitations: ['This is not a final diagnosis.'],
  humanVerificationRequired: true,
  finalDiagnosisProvided: false,
  repairApprovalProvided: false,
});

describe('validateControlledRepairMentorOutput', () => {
  it('accepts the exact controlled response shape', () => {
    const output = validOutput();

    expect(validateControlledRepairMentorOutput(output)).toEqual(output);
  });

  it.each([
    ['human verification disabled', { humanVerificationRequired: false }],
    ['final diagnosis enabled', { finalDiagnosisProvided: true }],
    ['repair approval enabled', { repairApprovalProvided: true }],
  ])('rejects %s', (_label, replacement) => {
    expect(() =>
      validateControlledRepairMentorOutput({
        ...validOutput(),
        ...replacement,
      }),
    ).toThrow('Provider output failed controlled Repair Mentor validation.');
  });

  it('rejects extra free-form fields', () => {
    expect(() =>
      validateControlledRepairMentorOutput({
        ...validOutput(),
        finalDiagnosis: 'Replace the fuel pump.',
      }),
    ).toThrow('Provider output failed controlled Repair Mentor validation.');
  });

  it('rejects malformed next checks', () => {
    const output = validOutput();
    output.nextChecks[0].priority = 0;

    expect(() => validateControlledRepairMentorOutput(output)).toThrow(
      'Provider output failed controlled Repair Mentor validation.',
    );
  });
});
