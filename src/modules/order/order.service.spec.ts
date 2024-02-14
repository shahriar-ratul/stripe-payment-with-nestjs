import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';


// Mock PrismaService
class PrismaServiceMock {
  async orderCreate(data: any) {
    return { id: 1, ...data };
  }

  async orderFindUnique() {
    return {
      id: 1,
      total: 100,
      totalQty: 2,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    };
  }
}

// Mock StripeService
class StripeServiceMock {
  async createCheckoutSession() {
    return 'mocked-payment-url';
  }
}


describe('OrderService', () => {
  let service: OrderService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useClass: PrismaServiceMock },
        { provide: StripeService, useClass: StripeServiceMock },
      ],

    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });




});
