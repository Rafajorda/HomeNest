import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderLine } from './orderline.entity';
import { CreateOrderLineDto } from './orderline.dto';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class OrderlineService {
    constructor(
        @InjectRepository(OrderLine)
        private orderLineRepository: Repository<OrderLine>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {}

    getOrderLines(): Promise<OrderLine[]> {
        return this.orderLineRepository.find({
            relations: ['order', 'product'],
        });
    }

    async getOrderLineById(id: number): Promise<OrderLine> {
        const orderLine = await this.orderLineRepository.findOne({
            where: { id },
            relations: ['order', 'product'],
        });

        if (!orderLine) {
            throw new NotFoundException(`Línea de pedido con ID "${id}" no encontrada`);
        }

        return orderLine;
    }

    async createOrderLine(createOrderLineDto: CreateOrderLineDto) {
        const order = await this.orderRepository.findOne({
            where: { id: createOrderLineDto.orderId },
        });

        const product = await this.productRepository.findOne({
            where: { id: createOrderLineDto.productId },
        });

        if (!order) {
            throw new NotFoundException(`Pedido con ID "${createOrderLineDto.orderId}" no encontrado`);
        }

        if (!product) {
            throw new NotFoundException(`Producto con ID "${createOrderLineDto.productId}" no encontrado`);
        }

        const orderLine = this.orderLineRepository.create({
            quantity: createOrderLineDto.quantity,
            price: createOrderLineDto.price,
            order,
            product,
        });

        await this.orderLineRepository.save(orderLine);
        return orderLine;
    }

    async updateOrderLine(id: number, updateOrderLineDto: CreateOrderLineDto) {
        const orderLine = await this.orderLineRepository.findOne({
            where: { id },
        });

        if (!orderLine) {
            throw new NotFoundException(`Línea de pedido con ID "${id}" no encontrada`);
        }

        const order = await this.orderRepository.findOne({
            where: { id: updateOrderLineDto.orderId },
        });

        const product = await this.productRepository.findOne({
            where: { id: updateOrderLineDto.productId },
        });

        if (!order) {
            throw new NotFoundException(`Pedido con ID "${updateOrderLineDto.orderId}" no encontrado`);
        }

        if (!product) {
            throw new NotFoundException(`Producto con ID "${updateOrderLineDto.productId}" no encontrado`);
        }

        orderLine.quantity = updateOrderLineDto.quantity;
        orderLine.price = updateOrderLineDto.price;
        orderLine.order = order;
        orderLine.product = product;

        await this.orderLineRepository.save(orderLine);
        return orderLine;
    }

    async deleteOrderLine(id: number): Promise<void> {
        const result = await this.orderLineRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Línea de pedido con ID "${id}" no encontrada`);
        }
    }
}
