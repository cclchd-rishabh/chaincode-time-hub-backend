import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}

  @Get()
  getAllEmployees(): Employee[] {
    return this.employeesService.getAllEmployees();
  }

  @Get(':id')
  getEmployeeById(@Param('id') id: string): Employee | string {
    return this.employeesService.getEmployeeById(parseInt(id)) || "Employee not found";
  }
  
  @Post()
  createEmployee(@Body() body: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>): Employee {
    return this.employeesService.createEmployee(body);
  }

  @Put(':id')
  updateEmployee(@Param('id') id: string, @Body() updates: Partial<Employee>): Employee | string {
    return this.employeesService.updateEmployee(parseInt(id), updates) || "Employee not found";
  }

  @Delete(':id')
  deleteEmployee(@Param('id') id: string): string {
    return this.employeesService.deleteEmployee(parseInt(id));
  }
}
