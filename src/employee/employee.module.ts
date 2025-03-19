import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { Employee } from 'src/database/models/Employee';
import { DatabaseModule } from '../database/database.module'; // 👈 Import the DatabaseModule
import { Attendance } from 'src/database/models/Attendance';
import { Break } from 'src/database/models/Breaks';

@Module({
  imports: [SequelizeModule.forFeature([Employee, Attendance, Break]), AuthModule],
  providers: [EmployeeService, JwtAuthGuard, RolesGuard],
  controllers: [EmployeeController],
  exports: [EmployeeService], 
})
export class EmployeeModule {}
