import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Pool } from 'pg';
import {
  AiGatewayService,
  ControlledAiGatewayInvocationError,
} from '../ai-gateway/ai-gateway.service';
import {
  AiGatewayInvocationSuccess,
  RepairMentorGatewayRequest,
} from '../ai-gateway/ai-gateway.types';
import { DATABASE_CONNECTION } from '../db/database.provider';
import { RepairMentorInvokeResponse } from './repair-mentor.types';

interface RepairMentorContextRow {
  workspace_id: string;
  repair_case_id: string;
  slug: string;
  case_number: string;
  scenario_key: string;
  customer_complaint: string;
  check_key: string;
  status: string;
  result: string;
  mechanic_note: string | null;
}

@Injectable()
export class RepairMentorService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly pool: Pool,
    private readonly aiGatewayService: AiGatewayService,
  ) {}

  async invokeDemo(): Promise<RepairMentorInvokeResponse> {
    const contextResult = await this.pool.query<RepairMentorContextRow>(
      `SELECT w.id AS workspace_id, rc.id AS repair_case_id, w.slug,
         rc.case_number, rc.scenario_key, rc.customer_complaint,
         dc.check_key, dc.status, dc.result, dc.mechanic_note
       FROM workspaces w
       JOIN repair_cases rc ON rc.workspace_id = w.id
       JOIN diagnostic_checks dc ON dc.workspace_id = w.id AND dc.repair_case_id = rc.id
       WHERE w.slug = $1 AND rc.case_number = $2 AND rc.scenario_key = $3
       ORDER BY dc.check_key ASC`,
      ['demo-powersport-service', 'DEMO-RC-0001', 'starter_cranks_engine_no_start'],
    );
    const firstRow = contextResult.rows[0];
    if (!firstRow) {
      throw new NotFoundException('Demo diagnostic context not found');
    }

    const requestPayload: RepairMentorGatewayRequest = {
      workspace: { slug: firstRow.slug },
      repairCase: {
        caseNumber: firstRow.case_number,
        scenarioKey: firstRow.scenario_key,
        customerComplaint: firstRow.customer_complaint,
      },
      diagnosticChecks: contextResult.rows.map((row) => ({
        checkKey: row.check_key,
        status: row.status,
        result: row.result,
        mechanicNote: row.mechanic_note,
      })),
    };

    let invocation: AiGatewayInvocationSuccess;
    try {
      invocation = await this.aiGatewayService.invokeRepairMentor(
        {
          workspaceId: firstRow.workspace_id,
          repairCaseId: firstRow.repair_case_id,
        },
        requestPayload,
      );
    } catch (error) {
      if (error instanceof ControlledAiGatewayInvocationError) {
        throw new ServiceUnavailableException('Controlled Repair Mentor invocation failed');
      }
      throw error;
    }

    return {
      workspace: requestPayload.workspace,
      repairCase: requestPayload.repairCase,
      invocation: {
        providerKey: invocation.providerKey,
        promptVersion: invocation.promptVersion,
        invocationType: invocation.invocationType,
        status: invocation.status,
      },
      repairMentor: invocation.repairMentor,
      boundaries: {
        workspaceScoped: true,
        repairCaseScoped: true,
        diagnosticContextUsed: true,
        realProviderUsed: false,
        knowledgeRetrievalUsed: false,
        finalDiagnosisProvided: false,
        repairApprovalProvided: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    };
  }
}
