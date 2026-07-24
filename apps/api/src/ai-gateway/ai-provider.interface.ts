import { AiProviderKey, RepairMentorGatewayRequest } from './ai-gateway.types';

export interface AiGatewayProvider {
  readonly providerKey: AiProviderKey;
  readonly realProvider: boolean;

  invokeRepairMentor(
    request: RepairMentorGatewayRequest,
  ): Promise<unknown>;
}
