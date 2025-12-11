import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InfluencersModule } from './influencers/influencers.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ProductsModule } from './products/products.module';
import { ApifyModule } from './apify/apify.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CourierShipmentsModule } from './courier-shipments/courier-shipments.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    InfluencersModule,
    CampaignsModule,
    ProductsModule,
    ApifyModule,
    InvoicesModule,
    CourierShipmentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
