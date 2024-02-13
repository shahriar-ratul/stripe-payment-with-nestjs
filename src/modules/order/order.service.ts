import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateOrderDto, OrderItems } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { Order, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {

  constructor(
    private readonly _prisma: PrismaService,
  ) { }

  async findAll(query: PageOptionsDto): Promise<PageDto<Order>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;

    const sort = query.sort || 'id';

    const order = query.order || 'asc';


    const queryData: Prisma.OrderFindManyArgs = {
      where: {},
      include: {
        items: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
    };
    const [items, count] = await this._prisma.$transaction([
      this._prisma.order.findMany(queryData),
      this._prisma.order.count()
    ]);


    const pageOptionsDto = {
      limit: limit,
      page: page,
      skip: skip,
    };


    const pageMetaDto = new PageMetaDto({
      total: count,
      pageOptionsDto: pageOptionsDto,
    });


    return new PageDto(items, pageMetaDto);

  }



  async create(createOrderDto: CreateOrderDto) {


    console.log(createOrderDto);

    if (createOrderDto.items.length < 0) {
      throw new UnprocessableEntityException('The items of the Order are required');
    }

    // convert the items to an array of numbers
    const items = createOrderDto.items.map((item) => {
      return {
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }
    })

    console.log(items);

    const productsIds = items.map(item => item.productId);

    // check products NaN
    if (productsIds.some(id => isNaN(id))) {
      throw new UnprocessableEntityException('Product Ids must be numbers');
    }

    const products = await this._prisma.product.findMany({
      where: {
        id: {
          in: productsIds
        }
      }
    });

    if (products.length !== items.length) {
      throw new UnprocessableEntityException('Some products were not found');
    }

    const totalPrice = products.reduce((acc, product) => {
      const item = items.find(item => item.productId === product.id);
      return acc + product.price * item.quantity;
    }, 0);

    const totalQty = items.reduce((acc, item) => {
      return acc + Number(item.quantity);
    }, 0);

    const order = await this._prisma.order.create({
      data: {
        total: totalPrice,
        totalQty: totalQty,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      }
    });

    items.forEach(async item => {
      await this._prisma.orderItems.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity
        }
      });
    });


    const orderWithItems = await this._prisma.order.findUnique({
      where: {
        id: order.id
      },
      include: {
        items: true
      }
    });


    return {
      order: orderWithItems,
      message: 'Order created successfully'
    };
  }

  async findOne(id: number) {

    if (!id || isNaN(id)) {
      throw new UnprocessableEntityException('Id is required');
    }

    const order = await this._prisma.order.findUnique({
      where: {
        id: id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new UnprocessableEntityException('Order not found');
    }


    return {
      item: order,
      message: 'Order found successfully'
    }


  }


}
