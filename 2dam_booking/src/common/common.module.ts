import { Module } from '@nestjs/common';
import { ModelsController } from './controllers/models.controller';
import { FileConverterModule } from './services/file-converter.module';

@Module({
  imports: [FileConverterModule],
  controllers: [ModelsController],
})
export class CommonModule {}
