import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service';
import {
  DemoDiagnosticContextResponse,
  DemoRepairCaseResponse,
  DemoWorkspaceResponse,
} from './demo.types';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('workspace')
  getWorkspace(): Promise<DemoWorkspaceResponse> {
    return this.demoService.getWorkspace();
  }

  @Get('repair-case')
  getRepairCase(): Promise<DemoRepairCaseResponse> {
    return this.demoService.getRepairCase();
  }

  @Get('diagnostic-context')
  getDiagnosticContext(): Promise<DemoDiagnosticContextResponse> {
    return this.demoService.getDiagnosticContext();
  }
}
