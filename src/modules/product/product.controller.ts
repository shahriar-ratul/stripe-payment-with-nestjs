import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { Product } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly _productService: ProductService) { }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Product>> {
    return await this._productService.findAll(pageOptionsDto);
  }


  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this._productService.create(createProductDto);
  }

}
