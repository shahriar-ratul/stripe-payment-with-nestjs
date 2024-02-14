import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { StripeService } from './modules/stripe/stripe.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly _stripeService: StripeService,

  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
