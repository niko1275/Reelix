import db from './db';
import { categories } from './schema';

async function seed() {
  try {
    // Limpiar la tabla de categorías
    await db.delete(categories);

    // Insertar las categorías
    await db.insert(categories).values([
      {
        name: 'Gaming',
        description: 'Videos de juegos, gameplays, reviews y contenido relacionado con videojuegos',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      },
      {
        name: 'Tecnología',
        description: 'Noticias, reviews y tutoriales sobre tecnología, gadgets y software',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
      },
      {
        name: 'Música',
        description: 'Videos musicales, covers, tutoriales de instrumentos y contenido musical',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
      },
      {
        name: 'Cocina',
        description: 'Recetas, tutoriales de cocina, reviews de restaurantes y contenido gastronómico',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
      },
      {
        name: 'Deportes',
        description: 'Highlights, análisis deportivos, tutoriales y contenido deportivo',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop',
      },
      {
        name: 'Educación',
        description: 'Tutoriales, cursos, explicaciones y contenido educativo',
        imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2074&auto=format&fit=crop',
      },
      {
        name: 'Entretenimiento',
        description: 'Videos virales, memes, sketches y contenido de entretenimiento',
        imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
      },
      {
        name: 'Viajes',
        description: 'Vlogs de viajes, guías turísticas, recomendaciones y contenido de viajes',
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
      },
      {
        name: 'Fitness',
        description: 'Rutinas de ejercicio, consejos de salud, nutrición y contenido fitness',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
      },
      {
        name: 'Arte',
        description: 'Tutoriales de arte, timelapses, reviews de materiales y contenido artístico',
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop',
      }
    ]);

    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error al ejecutar el seed:', error);
  }
}

// Ejecutar el seed
seed(); 