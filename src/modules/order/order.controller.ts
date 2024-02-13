import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { Order } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly _orderService: OrderService) { }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Order>> {
    return await this._orderService.findAll(pageOptionsDto);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this._orderService.create(createOrderDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this._orderService.findOne(+id);
  }

}
