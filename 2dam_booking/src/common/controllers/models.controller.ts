import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FileConverterService } from '../services/file-converter.service';

@ApiTags('3D Models')
@Controller('models')
export class ModelsController {
  constructor(private readonly fileConverterService: FileConverterService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo .glb (ejemplo de uso)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo .glb a subir',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGlbFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar extensión
    this.fileConverterService.validateGlbExtension(file.originalname);
    
    // Validar tamaño
    this.fileConverterService.validateFileSize(file.buffer, 50);

    // Guardar archivo (ejemplo con ID temporal)
    const tempId = `temp-${Date.now()}`;
    const filePath = await this.fileConverterService.saveGlbFile(
      file.buffer,
      tempId,
    );

    return {
      message: 'Archivo subido correctamente',
      filePath,
      originalName: file.originalname,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      info: 'Este es un endpoint de ejemplo. Para productos, usar /product/:id/model',
    };
  }

  @Get('status/:filename')
  @ApiOperation({ summary: 'Verificar estado de un archivo' })
  async checkFileStatus(@Param('filename') filename: string) {
    const filePath = `uploads/models/${filename}`;
    const exists = this.fileConverterService.fileExists(filePath);

    if (!exists) {
      throw new BadRequestException('El archivo no existe');
    }

    const sizeMB = this.fileConverterService.getFileSizeInMB(filePath);

    return {
      exists,
      filePath,
      size: `${sizeMB.toFixed(2)} MB`,
    };
  }
}
