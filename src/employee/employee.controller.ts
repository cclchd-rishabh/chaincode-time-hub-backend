import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {Employee } from './employee.model';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}
    @Get()
    getAllEmployees(): Promise<any> {
        return this.employeesService.getEmployeeAttendanceDetails();
    }


  @Get(':id')
  getEmployeeById(@Param('id') id: string): Employee | string {
    return this.employeesService.getEmployeeById(parseInt(id)) as any || "Employee not found";
  }

  @Post()
  createEmployee(@Body() body: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>): Employee {
    return this.employeesService.createEmployee(body) as any || "Error in creating employee";
  }

  @Put(':id')
  updateEmployee(@Param('id') id: string, @Body() updates: Partial<Employee>): Employee | string {
    console.log('id' , id);
    console.log("Updates ->" ,updates)
    return this.employeesService.updateEmployee(parseInt(id), updates) as any || "Employee not found";
  }
  @Delete(':id')
  deleteEmployee(@Param('id') id:string): string{
    return this.employeesService.deleteEmployee(parseInt(id)) as any|| "Cannot Delete";
  }
  @Post('clock-in/:id')
  handleClockIn(@Param('id') id:string): any | string{
    console.log("Clock in Breaks ke route mai aya");
    return this.employeesService.handleAttendanceClockIn(parseInt(id)) as any || "Cannot handle breaks"
  }

  @Put('clock-out/:id')
  handleClockOut(@Param('id') id:string): any| string{
    console.log("Clock out Breaks ke route mai aya");
    return this.employeesService.handleAttendanceClockOut(parseInt(id)) as any || "Cannout handle breaks"
  }
  @Put('break-start/:id')
  handleStartBreak(@Param('id') id:string): any| string{
    console.log("Break Started for employee " , id);
    return this.employeesService.handleStartBreak(parseInt(id)) as any || "Cannot start break";
  }
  @Put('break-end/:id')
  handleEndBreak(@Param('id') id:string): any| string{
    console.log("Break Started for employee " , id);
    return this.employeesService.handleEndBreak(parseInt(id)) as any || "Cannot start break";
  }
}
