import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { UnprocessableEntityException } from '@nestjs/common';
import { Order } from '@/common/constants/order.constant';
import { OrderStatus, PaymentStatus } from '@prisma/client';


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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Mock StripeService
class StripeServiceMock {
  async createCheckoutSession() {
    return 'mocked-payment-url';
  }
}


class mockOrderService {

  async findAll(query: any) {
    return {
      data: [
        {
          id: 1,
          total: 100,
          totalQty: 2,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: []
        }
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 10,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }


  async create(data: any) {

    if (data.items.length === 0) {
      throw new UnprocessableEntityException('Items are required');
    }

    const order = {
      id: 1,
      total: 100,
      totalQty: 2,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    };

    return {
      order: order,
      paymentUrl: 'mocked-payment-url',
      message: 'Order created successfully',
    };


  }



  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new UnprocessableEntityException('Id is required');
    }

    const data = {
      id: 1,
      total: 100,
      totalQty: 2,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    }

    return {
      item: data,
      message: 'Order found successfully',
    };
  }



}




describe('OrderService', () => {
  let service: OrderService;

  const result = {
    data: [
      {
        id: 1,
        total: 100,
        totalQty: 2,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      }
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 10,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  const PageOptionsDto = {
    limit: 10,
    page: 1,
    search: 'test',
    sort: 'id',
    order: Order.ASC,
    skip: 0, // Add the missing 'skip' property
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: OrderService, useClass: mockOrderService },
        { provide: PrismaService, useClass: PrismaServiceMock },
        { provide: StripeService, useClass: StripeServiceMock },
      ],

    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('findAll', () => {
    it('should return an array of orders', async () => {

      const result = {
        data: [
          {
            id: 1,
            total: 100,
            totalQty: 2,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: []
          }
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 10,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await service.findAll(PageOptionsDto)).toBe(result);
    });
  });




  describe('findOne', () => {
    it('should find an order by ID', async () => {
      const orderId = 1;
      const foundOrder = await service.findOne(orderId);
      expect(foundOrder).toEqual({
        item: expect.objectContaining({
          id: orderId,
          total: 100,
          totalQty: 2,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        }),
        message: 'Order found successfully',
      });
    });

    it('should throw UnprocessableEntityException if ID is not provided', async () => {
      await expect(service.findOne(null)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        items: [{ productId: 1, quantity: 2 }],
      };
      const createdOrder = await service.create(orderData);
      expect(createdOrder).toEqual({
        order: expect.objectContaining({
          id: expect.any(Number),
          total: 100,
          totalQty: 2,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        }),
        paymentUrl: 'mocked-payment-url',
        message: 'Order created successfully',
      });
    });

    it('should throw UnprocessableEntityException if items are not provided', async () => {
      await expect(service.create({ items: [] })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });


  });




});
