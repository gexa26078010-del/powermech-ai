import { Injectable } from '@nestjs/common';
import { AiGatewayProvider } from './ai-provider.interface';
import {
  ControlledRepairMentorOutput,
  DETERMINISTIC_STUB_PROVIDER_KEY,
  RepairMentorGatewayRequest,
} from './ai-gateway.types';

@Injectable()
export class DeterministicStubProvider implements AiGatewayProvider {
  readonly providerKey = DETERMINISTIC_STUB_PROVIDER_KEY;
  readonly realProvider = false;

  async invokeRepairMentor(
    request: RepairMentorGatewayRequest,
  ): Promise<ControlledRepairMentorOutput> {
    const checksByKey = new Map(request.diagnosticChecks.map((check) => [check.checkKey, check]));
    const exactIdentity =
      request.workspace.slug === 'demo-powersport-service' &&
      request.repairCase.caseNumber === 'DEMO-RC-0001' &&
      request.repairCase.scenarioKey === 'starter_cranks_engine_no_start' &&
      request.repairCase.customerComplaint === 'Starter cranks, engine does not start';
    const exactCheckSet =
      request.diagnosticChecks.length === 3 &&
      checksByKey.size === 3 &&
      ['battery_voltage_static', 'fuel_pump_prime', 'spark_presence'].every((checkKey) =>
        checksByKey.has(checkKey),
      );
    const batteryVoltage = checksByKey.get('battery_voltage_static');
    const fuelPumpPrime = checksByKey.get('fuel_pump_prime');
    const sparkPresence = checksByKey.get('spark_presence');

    const supportedContext =
      exactIdentity &&
      exactCheckSet &&
      batteryVoltage?.status === 'recorded' &&
      batteryVoltage.result === 'pass' &&
      fuelPumpPrime?.status === 'recorded' &&
      fuelPumpPrime.result === 'unknown' &&
      sparkPresence?.status === 'recorded' &&
      sparkPresence.result === 'not_checked';

    if (!supportedContext) {
      throw new Error('Deterministic stub received unsupported diagnostic context.');
    }

    return {
      summary:
        'Battery voltage is acceptable in the demo diagnostic context. Fuel pump prime is not confirmed and spark presence has not been checked.',
      nextChecks: [
        {
          checkKey: 'fuel_pump_prime_confirm',
          title: 'Confirm fuel pump prime',
          reason: 'Fuel pump prime is unknown in the recorded diagnostic context.',
          priority: 1,
        },
        {
          checkKey: 'spark_presence_check',
          title: 'Check spark presence',
          reason: 'Spark presence has not been checked yet.',
          priority: 2,
        },
      ],
      safetyWarnings: [
        'Do not bypass safety procedures.',
        'Human mechanic verification is required before any repair decision.',
      ],
      limitations: [
        'This is controlled demo guidance, not a final diagnosis.',
        'No parts replacement decision is made by the system.',
      ],
      humanVerificationRequired: true,
      finalDiagnosisProvided: false,
      repairApprovalProvided: false,
    };
  }
}
