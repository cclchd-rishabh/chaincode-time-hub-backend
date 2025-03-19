import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { DatabaseService } from './users/users.module';
import { EmployeeModule } from './employee/employee.module';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ EmployeeModule, AuthModule],
  controllers: [AppController],
  providers: [DatabaseService, AppService],
  exports: [DatabaseService],
})
export class AppModule {}
