import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
  create(@Body() createProductDto: CreateProductDto) {
    return this._productService.create(createProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this._productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._productService.remove(+id);
  }
}
