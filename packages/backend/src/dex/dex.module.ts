import { Module } from '@nestjs/common';
import { DexController } from './dex.controller';
import { DexService } from './dex.service';
import { DexFactoryService } from './dex-factory.service';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [ChainModule],
  controllers: [DexController],
  providers: [DexService, DexFactoryService],
  exports: [DexService],
})
export class DexModule {}
