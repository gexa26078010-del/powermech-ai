import { ControlledRepairMentorOutput } from './ai-gateway.types';

const TOP_LEVEL_KEYS = [
  'finalDiagnosisProvided',
  'humanVerificationRequired',
  'limitations',
  'nextChecks',
  'repairApprovalProvided',
  'safetyWarnings',
  'summary',
] as const;
const NEXT_CHECK_KEYS = ['checkKey', 'priority', 'reason', 'title'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean => {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index])
  );
};

const isBoundedString = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= maxLength;

const isBoundedStringArray = (
  value: unknown,
  maximumItems: number,
): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= maximumItems &&
  value.every((item) => isBoundedString(item, 500));

export const validateControlledRepairMentorOutput = (
  value: unknown,
): ControlledRepairMentorOutput => {
  const validTopLevel =
    isRecord(value) &&
    hasExactKeys(value, TOP_LEVEL_KEYS) &&
    isBoundedString(value.summary, 1000) &&
    isBoundedStringArray(value.safetyWarnings, 5) &&
    isBoundedStringArray(value.limitations, 5) &&
    value.humanVerificationRequired === true &&
    value.finalDiagnosisProvided === false &&
    value.repairApprovalProvided === false;

  if (!validTopLevel || !Array.isArray(value.nextChecks)) {
    throw new Error('Provider output failed controlled Repair Mentor validation.');
  }

  const validNextChecks =
    value.nextChecks.length > 0 &&
    value.nextChecks.length <= 5 &&
    value.nextChecks.every(
      (nextCheck) =>
        isRecord(nextCheck) &&
        hasExactKeys(nextCheck, NEXT_CHECK_KEYS) &&
        isBoundedString(nextCheck.checkKey, 100) &&
        isBoundedString(nextCheck.title, 200) &&
        isBoundedString(nextCheck.reason, 500) &&
        Number.isInteger(nextCheck.priority) &&
        (nextCheck.priority as number) >= 1 &&
        (nextCheck.priority as number) <= 10,
    );

  if (!validNextChecks) {
    throw new Error('Provider output failed controlled Repair Mentor validation.');
  }

  return value as unknown as ControlledRepairMentorOutput;
};
