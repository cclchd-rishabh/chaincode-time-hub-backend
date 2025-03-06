import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { DatabaseModule } from '../database/database.module'; // 👈 Import the DatabaseModule

@Module({
  imports: [DatabaseModule], // 👈 Import to use DatabaseService
  providers: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
