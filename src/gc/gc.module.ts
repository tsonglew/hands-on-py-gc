import { Module } from '@nestjs/common';
import { GcController } from './gc.controller';
import { GcService } from './gc.service';

@Module({
  controllers: [GcController],
  providers: [GcService],
})
export class GcModule {}
