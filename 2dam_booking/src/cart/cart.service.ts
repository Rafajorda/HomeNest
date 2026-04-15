import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './cart.entity';
import { CartProduct } from './cartProduct.entity';
import { CreateCartDto } from './cart.dto';
import { Product } from '../product/product.entity';
import { User } from '../users/user.entity';
import { Order } from '../order/order.entity';
import { OrderLine } from '../orderline/orderline.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartProduct)
        private cartProductRepository: Repository<CartProduct>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderLine)
        private orderLineRepository: Repository<OrderLine>,
    ) {}

    /**
     * Genera un slug único para una orden
     * Formato: order-{timestamp}-{random}
     */
    private generateOrderSlug(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `order-${timestamp}-${random}`;
    }

    // ==================== ADMIN: CRUD COMPLETO ====================
    getCarts(): Promise<Cart[]> {
        return this.cartRepository.find({
            relations: ['user', 'cartProducts', 'cartProducts.product'],
        });
    }

    async getCartById(id: number): Promise<Cart | null> {
        const cart = await this.cartRepository.findOne({
            where: { id },
            relations: ['user', 'cartProducts', 'cartProducts.product'],
        });
        return cart;
    }

    async createCart(createCartDto: CreateCartDto) {
        const { productIds, ...cartData } = createCartDto;
        const cart = this.cartRepository.create({
            ...cartData,
        });

        if (productIds?.length) {
            const products = await this.productRepository.find({
                where: { id: In(productIds) },
            });
            // Aquí deberías crear CartProduct en lugar de asignar directamente
            // Por ahora lo dejamos así para mantener compatibilidad
        }

        await this.cartRepository.save(cart);
        return cart;
    }

    async updateCart(id: number, updateCartDto: CreateCartDto) {
        const cart = await this.cartRepository.findOne({
            where: { id },
            relations: ['cartProducts'],
        });

        if (!cart) {
            throw new NotFoundException('Carrito no encontrado');
        }

        const { productIds, ...cartData } = updateCartDto;
        Object.assign(cart, cartData);

        if (productIds?.length) {
            const products = await this.productRepository.find({
                where: { id: In(productIds) },
            });
            // Aquí deberías crear CartProduct en lugar de asignar directamente
        }

        await this.cartRepository.save(cart);
        return cart;
    }

    async deleteCart(id: number): Promise<void> {
        const result = await this.cartRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Carrito no encontrado');
        }
    }

    // ==================== USER: CARRITO PROPIO ====================
    async getMyCart(userId: number) {
        // Obtener el carrito del usuario
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['cartProducts', 'cartProducts.product', 'cartProducts.product.images'],
        });

        // Si no tiene carrito, crear uno
        if (!cart) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }
            cart = this.cartRepository.create({
                user,
                total: 0,
                status: 'active',
            });
            await this.cartRepository.save(cart);
            cart.cartProducts = [];
        }

        return cart;
    }

    async addToCart(userId: number, productId: string) {
        // Verificar que el producto existe
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        // Obtener o crear el carrito del usuario
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!cart) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }
            cart = this.cartRepository.create({
                user,
                total: 0,
                status: 'active',
            });
            await this.cartRepository.save(cart);
        }

        // Verificar si el producto ya está en el carrito
        const existingCartProduct = await this.cartProductRepository.findOne({
            where: {
                cart: { id: cart.id },
                product: { id: productId },
            },
        });

        if (existingCartProduct) {
            // Incrementar cantidad
            existingCartProduct.quantity += 1;
            await this.cartProductRepository.save(existingCartProduct);
            
            // Actualizar total del carrito
            cart.total = Number(cart.total) + Number(product.price);
            await this.cartRepository.save(cart);
            
            return existingCartProduct;
        } else {
            // Crear nuevo item en el carrito
            const newCartProduct = this.cartProductRepository.create({
                cart,
                product,
                quantity: 1,
            });
            await this.cartProductRepository.save(newCartProduct);
            
            // Actualizar total del carrito
            cart.total = Number(cart.total) + Number(product.price);
            await this.cartRepository.save(cart);
            
            return newCartProduct;
        }
    }

    async removeFromCart(userId: number, productId: string) {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!cart) {
            throw new NotFoundException('Carrito no encontrado');
        }

        const cartProduct = await this.cartProductRepository.findOne({
            where: {
                cart: { id: cart.id },
                product: { id: productId },
            },
            relations: ['product'],
        });

        if (!cartProduct) {
            throw new NotFoundException('Producto no encontrado en el carrito');
        }

        // Actualizar total del carrito
        cart.total = Number(cart.total) - (Number(cartProduct.product.price) * cartProduct.quantity);
        await this.cartRepository.save(cart);

        await this.cartProductRepository.remove(cartProduct);
        return { message: 'Producto eliminado del carrito' };
    }

    async clearCart(userId: number) {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!cart) {
            throw new NotFoundException('Carrito no encontrado');
        }

        const cartProducts = await this.cartProductRepository.find({
            where: { cart: { id: cart.id } },
        });

        await this.cartProductRepository.remove(cartProducts);
        
        // Resetear total del carrito
        cart.total = 0;
        await this.cartRepository.save(cart);
        
        return { message: 'Carrito vaciado' };
    }

    // ==================== CREAR PEDIDO DESDE CARRITO ====================
    async createOrderFromCart(userId: number) {
        // Obtener el carrito con sus productos
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['cartProducts', 'cartProducts.product'],
        });

        if (!cart || !cart.cartProducts || cart.cartProducts.length === 0) {
            throw new BadRequestException('El carrito está vacío');
        }

        // Calcular total
        const total = cart.cartProducts.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        // Crear el pedido
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        const newOrder = this.orderRepository.create({
            user,
            total,
            slug: this.generateOrderSlug(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.orderRepository.save(newOrder);

        // Crear las líneas de pedido
        const orderLines = cart.cartProducts.map(item => {
            return this.orderLineRepository.create({
                order: newOrder,
                product: item.product,
                quantity: item.quantity,
                price: Number(item.product.price),
            });
        });

        await this.orderLineRepository.save(orderLines);

        // Vaciar el carrito
        await this.cartProductRepository.remove(cart.cartProducts);
        cart.total = 0;
        await this.cartRepository.save(cart);

        // Retornar el pedido completo
        return this.orderRepository.findOne({
            where: { id: newOrder.id },
            relations: ['orderLines', 'orderLines.product', 'orderLines.product.images'],
        });
    }
}
