import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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


  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
