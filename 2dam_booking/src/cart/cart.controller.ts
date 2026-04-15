import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CreateCartDto } from './cart.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    async getCarts(): Promise<Cart[]> {
        console.log('GET /cart requested');
        return this.cartService.getCarts();
    }

    @Get(':id')
    async getCartById(@Param('id', ParseIntPipe) id: number): Promise<Cart | null> {
        return this.cartService.getCartById(id);
    }

    @Post()
    createCart(@Body() createCartDto: CreateCartDto) {
        return this.cartService.createCart(createCartDto);
    }

    @Put(':id')
    updateCart(@Param('id', ParseIntPipe) id: number, @Body() updateCartDto: CreateCartDto) {
        return this.cartService.updateCart(id, updateCartDto);
    }

    @Delete(':id')
    async deleteCart(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.cartService.deleteCart(id);
    }
}
