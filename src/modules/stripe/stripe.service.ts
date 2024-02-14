import { Injectable, Query } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { Order, PaymentStatus } from '@prisma/client';


@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private readonly _prisma: PrismaService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
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
                        unit_amount: storedItem.price * USD_RATE,
                    },
                    quantity: item.quantity,
                };
            }),
        );


        const session = await this.stripe.checkout.sessions.create({
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

}
