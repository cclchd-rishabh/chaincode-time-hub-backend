import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users',  
  timestamps: false,  // No createdAt & updatedAt
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare username: string;  // `declare` prevents shadowing Sequelize attributes

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare role: string;
}
