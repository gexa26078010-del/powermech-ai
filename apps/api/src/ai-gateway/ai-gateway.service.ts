import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
import { AiGatewayProvider } from './ai-provider.interface';
import {
  AiProviderConfigurationError,
  AiProviderSelector,
} from './ai-provider.selector';
import {
  AiGatewayAuditProviderKey,
  AiGatewayInvocationSuccess,
  AiGatewayInvocationScope,
  ControlledRepairMentorOutput,
  DETERMINISTIC_STUB_PROVIDER_KEY,
  REPAIR_MENTOR_INVOCATION_TYPE,
  REPAIR_MENTOR_PROMPT_VERSION,
  RepairMentorGatewayRequest,
} from './ai-gateway.types';
import { validateControlledRepairMentorOutput } from './controlled-repair-mentor-output.validator';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown AI provider error.';

export class ControlledAiGatewayInvocationError extends Error {
  constructor() {
    super('Controlled AI Gateway invocation failed');
    this.name = 'ControlledAiGatewayInvocationError';
  }
}

@Injectable()
export class AiGatewayService {
  constructor(
    private readonly providerSelector: AiProviderSelector,
    @Inject(DATABASE_CONNECTION) private readonly pool: Pool,
  ) {}

  async invokeRepairMentor(
    scope: AiGatewayInvocationScope,
    request: RepairMentorGatewayRequest,
  ): Promise<AiGatewayInvocationSuccess> {
    let provider: AiGatewayProvider | undefined;
    let auditProviderKey: AiGatewayAuditProviderKey =
      DETERMINISTIC_STUB_PROVIDER_KEY;
    let repairMentor: ControlledRepairMentorOutput;
    try {
      provider = this.providerSelector.select();
      auditProviderKey = provider.providerKey;
      const providerOutput = await provider.invokeRepairMentor(request);
      repairMentor = validateControlledRepairMentorOutput(providerOutput);
    } catch (error) {
      if (error instanceof AiProviderConfigurationError) {
        auditProviderKey = error.providerKey;
      }
      await this.logInvocation(
        scope,
        request,
        {},
        auditProviderKey,
        'failed',
        getErrorMessage(error),
      );
      throw new ControlledAiGatewayInvocationError();
    }

    if (!provider) throw new ControlledAiGatewayInvocationError();
    const invocation: AiGatewayInvocationSuccess = {
      providerKey: provider.providerKey,
      promptVersion: REPAIR_MENTOR_PROMPT_VERSION,
      invocationType: REPAIR_MENTOR_INVOCATION_TYPE,
      status: 'succeeded',
      realProviderUsed: provider.realProvider,
      repairMentor,
    };
    await this.logInvocation(
      scope,
      request,
      repairMentor,
      provider.providerKey,
      invocation.status,
      null,
    );
    return invocation;
  }

  private async logInvocation(
    scope: AiGatewayInvocationScope,
    requestPayload: RepairMentorGatewayRequest,
    responsePayload: ControlledRepairMentorOutput | Record<string, never>,
    providerKey: AiGatewayAuditProviderKey,
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
        providerKey,
        REPAIR_MENTOR_INVOCATION_TYPE,
        requestPayload,
        responsePayload,
        status,
        errorMessage,
      ],
    );
  }
}
