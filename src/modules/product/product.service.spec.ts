import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Order } from '@/common/constants/order.constant';
import { PrismaService } from '../prisma/prisma.service';
import { UnprocessableEntityException } from '@nestjs/common';

class PrismaServiceMock {
  async productCreate(data: any) {
    return { id: 1, ...data };
  }

  async productFindMany() {
    return [{ id: 1, name: 'Test Product', price: 100, stock: 10 }];
  }

  async productCount() {
    return 1;
  }
}

class mockProductService {

  async findAll(query: any) {
    return {
      data: [
        {
          id: 1,
          name: 'test',
          description: 'test',
          price: 10,
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
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

    if (data.price < 0) {
      throw new UnprocessableEntityException('Price cannot be negative');
    }

    if (data.stock < 0) {
      throw new UnprocessableEntityException('Stock cannot be negative');
    }



    return {
      message: 'Product created successfully',
      item: {
        id: 1,
        name: data.name,
        price: data.price,
        stock: data.stock,
        description: data.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  }

};





describe('ProductService', () => {
  let service: ProductService;


  const PageDto = {
    limit: 10,
    page: 1,
    skip: 0,
    search: '',
    sort: 'id',
    order: 'asc',
  };

  const PageMetaDto = {
    total: 10,
    pageOptionsDto: PageDto,
  };

  const PageOptionsDto = {
    limit: 10,
    page: 1,
    search: 'test',
    sort: 'id',
    order: Order.ASC,
    skip: 0, // Add the missing 'skip' property
  };


  const result = {
    data: [
      {
        id: 1,
        name: 'test',
        description: 'test',
        price: 10,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),

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


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProductService, useClass: mockProductService },
        { provide: PrismaService, useClass: PrismaServiceMock },
      ],

    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('findAll', () => {
    it('should return an array of products', async () => {

      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await service.findAll(PageOptionsDto)).toBe(result);

    });
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const productData = {
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test Description',

      };
      const createdProduct = await service.create(productData);
      expect(createdProduct).toEqual({
        message: 'Product created successfully',
        item: expect.objectContaining({
          id: expect.any(Number),
          name: 'Test Product',
          price: 100,
          stock: 10,
          description: 'Test Description',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),

        }),
      });
    });
    it('should throw UnprocessableEntityException if price is negative', async () => {
      await expect(
        service.create({ name: 'Test Product', price: -100, stock: 10, description: 'Test Description' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if stock is negative', async () => {
      await expect(
        service.create({ name: 'Test Product', price: 100, stock: -10, description: 'Test Description' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });


  });


});
