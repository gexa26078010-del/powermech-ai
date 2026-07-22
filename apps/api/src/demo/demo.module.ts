import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({ imports: [DatabaseModule], controllers: [DemoController], providers: [DemoService] })
export class DemoModule {}
