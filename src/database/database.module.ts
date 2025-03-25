import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Employee } from './models/Employee';
import { Attendance } from './models/Attendance';
import { Break } from './models/Breaks';
import { User } from 'src/auth/user.model';

@Module({
  imports: [
    ConfigModule, 
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],  
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST', ''),
        port: parseInt(configService.get<string>('DB_PORT', ''), 10),
        username: configService.get<string>('DB_USERNAME', ''),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', ''),
        autoLoadModels: true,
        models: [Employee, Attendance, Break, User],
      }),
    }),
    SequelizeModule.forFeature([Employee, Attendance, Break, User]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
