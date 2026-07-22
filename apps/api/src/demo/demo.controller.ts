import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service';
import { DemoWorkspaceResponse } from './demo.types';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('workspace')
  getWorkspace(): Promise<DemoWorkspaceResponse> {
    return this.demoService.getWorkspace();
  }
}
