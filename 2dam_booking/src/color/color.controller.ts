import { Body, Controller, Get, Post, Put, Delete, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ColorService } from './color.service';
import { Color } from './color.entity';
import { CreateColorDto } from './color.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('color')
@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los colores (público)' })
  async getColors(): Promise<Color[]> {
    return this.colorService.getColors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener color por ID (público)' })
  async getColorById(@Param('id', ParseUUIDPipe) id: string): Promise<Color> {
    return this.colorService.getColorById(id);
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear nuevo color (solo admin)' })
  createColor(@Body() createColorDto: CreateColorDto) {
    return this.colorService.createColor(createColorDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar color (solo admin)' })
  updateColor(@Param('id', ParseUUIDPipe) id: string, @Body() updateColorDto: CreateColorDto) {
    return this.colorService.updateColor(id, updateColorDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar color (solo admin)' })
  async deleteColor(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.colorService.deleteColor(id);
  }
}
