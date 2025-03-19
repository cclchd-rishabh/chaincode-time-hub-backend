import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Employee } from './models/Employee';
import { Attendance } from './models/Attendance';
import { Break } from './models/Breaks';
import { User } from 'src/auth/user.model'; // ✅ Make sure the path is correct

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '3307'), 10),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASS', 'mysecretpassword'),
        database: configService.get<string>('DB_NAME', 'my_sequelize_db'),
        autoLoadModels: true, // ✅ This will automatically load all models
        synchronize: true,
        models: [Employee, Attendance, Break, User], // ✅ Ensure User is listed
      }),
    }),
    SequelizeModule.forFeature([Employee, Attendance, Break, User]), // ✅ Register User explicitly
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
