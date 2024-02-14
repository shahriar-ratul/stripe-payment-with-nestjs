import { Injectable, Logger, ParseIntPipe, Query, RawBodyRequest, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus, PaymentStatus } from '@prisma/client';


@Injectable()
export class StripeService {
    private _stripe: Stripe;
    private _endpointSecret;

    constructor(
        private readonly _prisma: PrismaService,
    ) {
        this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        this._endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    async createCheckoutSession(items: { id: number; quantity: number }[], order: Order) {
        const USD_RATE: number = Number(process.env.USD_RATE) || 100;

        const storedItems = await Promise.all(
            items.map(async (item) => {
                const storedItem = await this._prisma.product.findUnique({
                    where: { id: item.id },
                });
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storedItem.name,
                        },
                        unit_amount: parseInt((storedItem.price / USD_RATE).toFixed(0)),
                    },
                    quantity: item.quantity,
                };
            }),
        );


        const session = await this._stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: storedItems,
            success_url: process.env.APP_URL + '/api/success',
            cancel_url: process.env.APP_URL + '/api/cancel',
        });



        await this._prisma.payment.create({
            data: {
                amount: session.amount_total,
                currency: session.currency,
                status: PaymentStatus.UNPAID,
                paymentId: session.id,

                order: {
                    connect: {
                        id: order.id,
                    },
                },

            },
        });


        return session.url;
    }


    async getSuccess() {
        console.log();


        return 'Payment was successful';
    }

    async getCancel() {
        return 'Payment was cancelled';
    }



    async stripe(@Req() request: RawBodyRequest<Request>) {

        const sig = request.headers['stripe-signature'];

        const rawBody = request.rawBody;


        let event;
        try {
            event = this._stripe.webhooks.constructEvent(rawBody, sig, this._endpointSecret);
        } catch (err) {
            console.log(err);
            return;
        }

        // console.log(event);

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const paymentIntentSucceeded = event.data.object;
                // Then define and call a function to handle the event payment_intent.succeeded

                // console.log(paymentIntentSucceeded);
                Logger.log('PaymentIntent was successful!');


                const payment = await this._prisma.payment.findFirst({
                    where: {
                        paymentId: paymentIntentSucceeded.id,
                    },
                });

                if (!payment) {
                    console.log('Payment not found');
                    return;
                }

                await this._prisma.payment.update({
                    where: {
                        id: payment.id,
                    },

                    data: {
                        status: PaymentStatus.PAID,
                        paymentDate: new Date(),
                        paymentType: paymentIntentSucceeded.payment_method_types[0],
                    },
                });

                await this._prisma.order.update({
                    where: {
                        id: payment.orderId,
                    },
                    data: {
                        status: OrderStatus.COMPLETED,
                        paymentStatus: PaymentStatus.PAID,
                    },
                });



                // console.log(payment);



                break;
            // ... handle other event types
            default:

                console.log(`Unhandled event type ${event.type}`);
        }

        return;
    }


}
