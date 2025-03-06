import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    this.pool = await createPool({
      host: 'localhost',
      user: 'root',
      password: 'secret',
      database: 'mydb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ MySQL Database Connected');
  }

  async query(sql: string, params: any[] = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  getPool() {
    return this.pool;
  }
}
