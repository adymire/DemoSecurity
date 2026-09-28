import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { HwidService } from './hwid.service';
import { AntiVmService } from './anti-vm.service';
import { NetworkIntelService } from './network-intel.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RiskController],
  providers: [RiskService, HwidService, AntiVmService, NetworkIntelService],
  exports: [RiskService, HwidService, AntiVmService, NetworkIntelService],
})
export class RiskModule {}
