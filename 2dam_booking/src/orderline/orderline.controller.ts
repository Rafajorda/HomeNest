import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { OrderlineService } from './orderline.service';
import { OrderLine } from './orderline.entity';
import { CreateOrderLineDto } from './orderline.dto';

@Controller('orderline')
export class OrderlineController {
    constructor(private readonly orderLineService: OrderlineService) {}

    @Get()
    async getOrderLines(): Promise<OrderLine[]> {
        console.log('GET /orderline requested');
        return this.orderLineService.getOrderLines();
    }

    @Get(':id')
    async getOrderLineById(@Param('id', ParseIntPipe) id: number): Promise<OrderLine | null> {
        return this.orderLineService.getOrderLineById(id);
    }

    @Post()
    createOrderLine(@Body() createOrderLineDto: CreateOrderLineDto) {
        return this.orderLineService.createOrderLine(createOrderLineDto);
    }

    @Put(':id')
    updateOrderLine(@Param('id', ParseIntPipe) id: number, @Body() updateOrderLineDto: CreateOrderLineDto) {
        return this.orderLineService.updateOrderLine(id, updateOrderLineDto);
    }

    @Delete(':id')
    async deleteOrderLine(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.orderLineService.deleteOrderLine(id);
    }
}
