import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
import {
  AiGatewayInvocationSuccess,
  AiGatewayInvocationScope,
  ControlledRepairMentorOutput,
  DETERMINISTIC_STUB_PROVIDER_KEY,
  REPAIR_MENTOR_INVOCATION_TYPE,
  REPAIR_MENTOR_PROMPT_VERSION,
  RepairMentorGatewayRequest,
} from './ai-gateway.types';
import { DeterministicStubProvider } from './deterministic-stub.provider';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown deterministic provider error.';

export class ControlledAiGatewayInvocationError extends Error {
  constructor() {
    super('Controlled AI Gateway invocation failed');
    this.name = 'ControlledAiGatewayInvocationError';
  }
}

@Injectable()
export class AiGatewayService {
  constructor(
    private readonly deterministicStubProvider: DeterministicStubProvider,
    @Inject(DATABASE_CONNECTION) private readonly pool: Pool,
  ) {}

  async invokeRepairMentor(
    scope: AiGatewayInvocationScope,
    request: RepairMentorGatewayRequest,
  ): Promise<AiGatewayInvocationSuccess> {
    let repairMentor: ControlledRepairMentorOutput;
    try {
      repairMentor = this.deterministicStubProvider.invokeRepairMentor(request);
    } catch (error) {
      await this.logInvocation(scope, request, {}, 'failed', getErrorMessage(error));
      throw new ControlledAiGatewayInvocationError();
    }

    const invocation: AiGatewayInvocationSuccess = {
      providerKey: DETERMINISTIC_STUB_PROVIDER_KEY,
      promptVersion: REPAIR_MENTOR_PROMPT_VERSION,
      invocationType: REPAIR_MENTOR_INVOCATION_TYPE,
      status: 'succeeded',
      repairMentor,
    };
    await this.logInvocation(scope, request, repairMentor, invocation.status, null);
    return invocation;
  }

  private async logInvocation(
    scope: AiGatewayInvocationScope,
    requestPayload: RepairMentorGatewayRequest,
    responsePayload: ControlledRepairMentorOutput | Record<string, never>,
    status: 'succeeded' | 'failed',
    errorMessage: string | null,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO ai_gateway_invocations
         (id, workspace_id, repair_case_id, prompt_version, provider_key,
          invocation_type, request_payload, response_payload, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        randomUUID(),
        scope.workspaceId,
        scope.repairCaseId,
        REPAIR_MENTOR_PROMPT_VERSION,
        DETERMINISTIC_STUB_PROVIDER_KEY,
        REPAIR_MENTOR_INVOCATION_TYPE,
        requestPayload,
        responsePayload,
        status,
        errorMessage,
      ],
    );
  }
}
