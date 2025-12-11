import { Module } from '@nestjs/common';
import { CourierShipmentsController } from './courier-shipments.controller';
import { CourierShipmentsService } from './courier-shipments.service';

@Module({
  imports: [],
  controllers: [CourierShipmentsController],
  providers: [CourierShipmentsService],
  exports: [CourierShipmentsService],
})
export class CourierShipmentsModule {}
