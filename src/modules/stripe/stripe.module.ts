import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule { }
