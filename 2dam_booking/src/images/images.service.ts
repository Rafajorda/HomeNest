import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesProduct } from './images.entity';
import { CreateImageDto } from './images.dto';
import { Product } from '../product/product.entity';

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(ImagesProduct)
        private imagesRepository: Repository<ImagesProduct>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {}

    getImages(): Promise<ImagesProduct[]> {
        return this.imagesRepository.find({
            relations: ['product'],
        });
    }

    async getImageById(id: number): Promise<ImagesProduct> {
        const image = await this.imagesRepository.findOne({
            where: { id },
            relations: ['product'],
        });

        if (!image) {
            throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
        }

        return image;
    }

    async createImage(createImageDto: CreateImageDto) {
        const product = await this.productRepository.findOne({
            where: { id: createImageDto.productId },
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${createImageDto.productId}" no encontrado`);
        }

        const image = this.imagesRepository.create({
            src: createImageDto.src,
            alt: createImageDto.alt,
            product,
        });

        await this.imagesRepository.save(image);
        return image;
    }

    async updateImage(id: number, updateImageDto: CreateImageDto) {
        const image = await this.imagesRepository.findOne({
            where: { id },
        });

        if (!image) {
            throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
        }

        const product = await this.productRepository.findOne({
            where: { id: updateImageDto.productId },
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${updateImageDto.productId}" no encontrado`);
        }

        image.src = updateImageDto.src;
        image.alt = updateImageDto.alt;
        image.product = product;

        await this.imagesRepository.save(image);
        return image;
    }

    async deleteImage(id: number): Promise<void> {
        const result = await this.imagesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
        }
    }
}
