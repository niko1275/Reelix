import db from './db';
import { users } from '../schemas/schema';

async function testConnection() {
  try {
    
    const result = await db.select().from(users);
    console.log('✅ Conexión exitosa a la base de datos!');
    console.log('Datos encontrados:', result);
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
}

testConnection(); 