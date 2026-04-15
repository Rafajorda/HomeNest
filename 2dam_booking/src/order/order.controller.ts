import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener todas las órdenes (solo admin)' })
    async getOrders(): Promise<Order[]> {
        console.log('GET /order requested');
        return this.orderService.getOrders();
    }

    @Get('user')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener mis órdenes' })
    async getMyOrders(@CurrentUser() user: any): Promise<Order[]> {
        console.log('GET /order/user requested by user:', user.sub);
        return this.orderService.getOrdersByUser(user.sub);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener orden por ID (admin o propietario)' })
    async getOrderById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any
    ): Promise<Order | null> {
        const order = await this.orderService.getOrderById(id);
        
        // Si no es admin, verificar que la orden le pertenece
        if (user.role !== 'ADMIN' && order.user.id !== user.sub) {
            throw new ForbiddenException('No tienes permiso para ver esta orden');
        }
        
        return order;
    }

    @Post()
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Crear nueva orden (solo admin)' })
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.createOrder(createOrderDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Actualizar orden (solo admin)' })
    updateOrder(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.updateOrder(id, updateOrderDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Eliminar orden (solo admin)' })
    async deleteOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.orderService.deleteOrder(id);
    }
}
