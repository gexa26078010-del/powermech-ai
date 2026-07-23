import { Controller, Post } from '@nestjs/common';
import { RepairMentorService } from './repair-mentor.service';
import { RepairMentorInvokeResponse } from './repair-mentor.types';

@Controller('demo/repair-mentor')
export class RepairMentorController {
  constructor(private readonly repairMentorService: RepairMentorService) {}

  @Post('invoke')
  invoke(): Promise<RepairMentorInvokeResponse> {
    return this.repairMentorService.invokeDemo();
  }
}
