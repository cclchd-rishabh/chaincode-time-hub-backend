import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Employee } from './Employee';
import { Break } from './Breaks';

@Table({ tableName: 'attendance', timestamps: true })
export class Attendance extends Model<Attendance> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Employee)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare employee_id: number; 

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare clock_in: number;
  
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare clock_out: number;
  
  @Column({
    type: DataType.ENUM('active', 'inactive', 'resigned', 'not-present', 'day-over'),
    allowNull: true,
    defaultValue: 'not-present',
  })
  declare status: string;
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare total_time: number;
  
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare total_work_time: number;
  
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare total_break_time: number;

  @BelongsTo(() => Employee, { foreignKey: 'employee_id' ,as: 'employee'})
  declare employee: Employee; //association with Employee

  @HasMany(() => Break, { foreignKey: 'attendance_id', as: 'breaks' })
  declare breaks: Break[];
}
