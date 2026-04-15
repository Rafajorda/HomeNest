import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesProduct } from './images.entity';
import { CreateImageDto } from './images.dto';

@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}

    @Get()
    async getImages(): Promise<ImagesProduct[]> {
        console.log('GET /images requested');
        return this.imagesService.getImages();
    }

    @Get(':id')
    async getImageById(@Param('id', ParseIntPipe) id: number): Promise<ImagesProduct | null> {
        return this.imagesService.getImageById(id);
    }

    @Post()
    createImage(@Body() createImageDto: CreateImageDto) {
        return this.imagesService.createImage(createImageDto);
    }

    @Put(':id')
    updateImage(@Param('id', ParseIntPipe) id: number, @Body() updateImageDto: CreateImageDto) {
        return this.imagesService.updateImage(id, updateImageDto);
    }

    @Delete(':id')
    async deleteImage(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.imagesService.deleteImage(id);
    }
}
