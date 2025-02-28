import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [UsersModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
