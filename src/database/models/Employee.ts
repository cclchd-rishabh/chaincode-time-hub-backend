import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

import { Attendance } from './Attendance';

@Table({ tableName: 'employees', timestamps: true })
export class Employee extends Model<Employee> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({type:DataType.STRING(20),allowNull:false , unique:true})
  declare emp_id:string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare first_name: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare last_name: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare avatar: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare department: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare role: string;

  @Column({
    type: DataType.ENUM('remote', 'in-office'),
    allowNull: false,
    defaultValue: 'in-office',
  })
  declare work_location: string;
 
  @HasMany(() => Attendance, { foreignKey: 'employee_id',as :'attendances' }) 
  declare attendances: Attendance[];
  employee_id: null;
}
