import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './color.entity';
import { CreateColorDto } from './color.dto';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private colorRepository: Repository<Color>,
  ) {}

  async getColors(): Promise<Color[]> {
    return this.colorRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getColorById(id: string): Promise<Color> {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(`Color con ID "${id}" no encontrado`);
    }
    return color;
  }

  async getColorByName(name: string): Promise<Color | null> {
    return this.colorRepository.findOne({ where: { name } });
  }

  async createColor(createColorDto: CreateColorDto): Promise<Color> {
    // Verificar si ya existe un color con ese nombre
    const existingColor = await this.getColorByName(createColorDto.name);
    if (existingColor) {
      throw new ConflictException(`Ya existe un color con el nombre "${createColorDto.name}"`);
    }

    const color = this.colorRepository.create(createColorDto);
    return this.colorRepository.save(color);
  }

  async updateColor(id: string, updateColorDto: CreateColorDto): Promise<Color> {
    const color = await this.getColorById(id);

    // Si se está actualizando el nombre, verificar que no exista otro color con ese nombre
    if (updateColorDto.name && updateColorDto.name !== color.name) {
      const existingColor = await this.getColorByName(updateColorDto.name);
      if (existingColor) {
        throw new ConflictException(`Ya existe un color con el nombre "${updateColorDto.name}"`);
      }
    }

    Object.assign(color, updateColorDto);
    return this.colorRepository.save(color);
  }

  async deleteColor(id: string): Promise<void> {
    const color = await this.getColorById(id);
    await this.colorRepository.remove(color);
  }

  // Método para obtener o crear colores por nombres
  async getOrCreateColors(colorNames: string[]): Promise<Color[]> {
    const colors: Color[] = [];
    
    for (const name of colorNames) {
      let color = await this.getColorByName(name);
      if (!color) {
        color = await this.createColor({ name });
      }
      colors.push(color);
    }
    
    return colors;
  }
}
