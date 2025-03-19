import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Attendance } from './Attendance';

@Table({ tableName: 'breaks', timestamps: true })
export class Break extends Model<Break> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Attendance)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare attendance_id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare break_start: number;
  
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare break_end: number;

  @Column({
    type: DataType.ENUM('on_break', 'completed'),
    allowNull: false,
    defaultValue: 'completed',
  })
  
  declare status: string;
  @BelongsTo(() => Attendance, { foreignKey: 'attendance_id', as: 'attendance' }) 
declare attendance: Attendance;
}
