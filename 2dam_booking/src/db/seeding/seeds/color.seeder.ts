import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Color } from '../../../color/color.entity';
import { colorsData } from '../../../data/colors';

export class ColorSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const colorRepository = dataSource.getRepository(Color);

    console.log('🎨 Creando colores...');

    for (const colorData of colorsData) {
      const existingColor = await colorRepository.findOne({
        where: { name: colorData.name },
      });

      if (!existingColor) {
        const color = colorRepository.create(colorData);
        await colorRepository.save(color);
        console.log(`   ✓ Color creado: ${color.name}`);
      } else {
        console.log(`   - Color ya existe: ${colorData.name}`);
      }
    }

    console.log('✅ Colores creados exitosamente\n');
  }
}
