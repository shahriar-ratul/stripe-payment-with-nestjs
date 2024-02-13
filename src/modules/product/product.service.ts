import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma, Product } from '@prisma/client';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {

  constructor(
    private readonly _prisma: PrismaService,
  ) { }

  async findAll(query: PageOptionsDto): Promise<PageDto<Product>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'id';

    const order = query.order || 'asc';


    const queryData: Prisma.ProductFindManyArgs = {
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            }
          },
        ],
      },


      take: limit,
      skip: skip,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
    };
    const [items, count] = await this._prisma.$transaction([
      this._prisma.product.findMany(queryData),
      this._prisma.product.count({ where: queryData.where })
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


  async create(createProductDto: CreateProductDto) {

    // check price and stock is number and greater than 0
    const price = Number(createProductDto.price);

    const stock = Number(createProductDto.stock);

    if (isNaN(price)) {
      throw new UnprocessableEntityException('Price must be a number');
    }

    if (price < 0) {
      throw new UnprocessableEntityException('Price cannot be negative');
    }

    if (isNaN(stock)) {
      throw new UnprocessableEntityException('Stock must be a number');
    }

    if (stock < 0) {
      throw new UnprocessableEntityException('Stock cannot be negative');
    }



    const item: Product = await this._prisma.product.create({
      data: {
        name: createProductDto.name,
        price: price,
        stock: stock,
        description: createProductDto.description,
      }
    });

    return {
      message: 'Product created successfully',
      item,
    };



  }


}
