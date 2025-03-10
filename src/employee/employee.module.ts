import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import { DatabaseModule } from '../database/database.module'; // 👈 Import the DatabaseModule

@Module({
  imports: [DatabaseModule,AuthModule], // 👈 Import to use DatabaseService
  providers: [EmployeeService, JwtAuthGuard, RolesGuard],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
