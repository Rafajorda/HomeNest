import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileConverterService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'models');

  constructor() {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Guarda un archivo .glb en el sistema de archivos
   * @param file Buffer del archivo
   * @param productId ID del producto
   * @returns Ruta relativa del archivo guardado
   */
  async saveGlbFile(file: Buffer, productId: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileName = `product-${productId}-${timestamp}.glb`;
      const filePath = path.join(this.uploadsDir, fileName);

      // Guardar el archivo
      fs.writeFileSync(filePath, file);

      // Retornar la ruta relativa
      return `uploads/models/${fileName}`;
    } catch (error) {
      throw new BadRequestException('Error al guardar el archivo: ' + error.message);
    }
  }

  /**
   * Elimina un archivo .glb del sistema de archivos
   * @param filePath Ruta relativa del archivo
   */
  async deleteGlbFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      // No lanzamos error si falla el borrado
    }
  }

  /**
   * Verifica que el archivo existe
   * @param filePath Ruta relativa del archivo
   * @returns true si existe, false si no
   */
  fileExists(filePath: string): boolean {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Lee un archivo .glb
   * @param filePath Ruta relativa del archivo
   * @returns Buffer del archivo
   */
  async readGlbFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new BadRequestException('El archivo no existe');
      }

      return fs.readFileSync(fullPath);
    } catch (error) {
      throw new BadRequestException('Error al leer el archivo: ' + error.message);
    }
  }

  /**
   * Obtiene el tamaño del archivo en MB
   * @param filePath Ruta relativa del archivo
   * @returns Tamaño en MB
   */
  getFileSizeInMB(filePath: string): number {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const stats = fs.statSync(fullPath);
      return stats.size / (1024 * 1024);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Valida que el archivo no exceda el tamaño máximo
   * @param buffer Buffer del archivo
   * @param maxSizeMB Tamaño máximo en MB (por defecto 50MB)
   */
  validateFileSize(buffer: Buffer, maxSizeMB: number = 50): void {
    const fileSizeMB = buffer.length / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      throw new BadRequestException(
        `El archivo es demasiado grande (${fileSizeMB.toFixed(2)}MB). Máximo permitido: ${maxSizeMB}MB`
      );
    }
  }

  /**
   * Valida que el archivo sea .glb
   * @param originalName Nombre original del archivo
   */
  validateGlbExtension(originalName: string): void {
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.glb') {
      throw new BadRequestException('Solo se permiten archivos .glb');
    }
  }
}
