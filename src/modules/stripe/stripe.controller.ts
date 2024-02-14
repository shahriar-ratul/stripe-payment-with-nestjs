import { BadRequestException, Controller, Get, Headers, Logger, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';


@Controller()
export class StripeController {
  constructor(
    private readonly _stripeService: StripeService,
  ) { }

  @Get('/success')
  async getSuccess() {
    return await this._stripeService.getSuccess();
  }

  @Get('/cancel')
  async getCancel() {
    return await this._stripeService.getCancel();
  }

  @Post('/webhook')
  public async stripe(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ): Promise<void> {

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Invalid payload');
    }
    Logger.log('Stripe Webhook received');
    await this._stripeService.stripe(req);


  }


}
