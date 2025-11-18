import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChainModule } from './chain/chain.module';
import { DexModule } from './dex/dex.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChainModule,
    DexModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
