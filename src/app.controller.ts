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

  @Get('/success')
  async getSuccess() {
    return await this._stripeService.getSuccess();
  }

  @Get('/cancel')
  async getCancel() {
    return await this._stripeService.getCancel();
  }
}
