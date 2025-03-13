import { Controller, Get, Post, Put, Delete, Param, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}

  // 🔹 Anyone with a valid JWT can view employees (HR & Attendance Manager)
  @Get()
  getAllEmployees(): Promise<any> {
    return this.employeesService.getEmployeeAttendanceDetails();
  }
  @Roles('HR','Attendance_Manager')
  @Get('daily-attendance')
  async getDailyAttendance(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('Date parameter is required');
    }
    return this.employeesService.getEmployeeAttendanceDetailsDatewise(date);
  }
  @Roles('HR')
  @Get(':id')
  getEmployeeById(@Param('id') id: string): Employee | string {
    return this.employeesService.getEmployeeById(parseInt(id)) as any || 'Employee not found';
  }

  //  Only HR can create an employee
  @Roles('HR')
  @Post()
  createEmployee(@Body() body: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>): Employee | any {
    return this.employeesService.createEmployee(body) as any || 'Error in creating employee';
  }

  //  Only HR can update employee details
  @Roles('HR')
  @Put(':id')
  updateEmployee(@Param('id') id: string, @Body() updates: Partial<Employee>): Employee | string {
    return this.employeesService.updateEmployee(parseInt(id), updates) as any || 'Employee not found';
  }

  //  Only HR can delete an employee
  @Roles('HR')
  @Delete(':id')
  deleteEmployee(@Param('id') id: string): string {
    return this.employeesService.deleteEmployee(parseInt(id)) as any || 'Cannot Delete';
  }

  // Attendance Manager and HR can clock-in employees
  @Roles('HR','Attendance_Manager')
  @Post('clock-in/:id')
  handleClockIn(@Param('id') id: string): any | string {
    return this.employeesService.handleAttendanceClockIn(parseInt(id)) as any || 'Cannot clock in';
  }

  // HR and Attendance Manager can clock-out employees
  @Roles('HR','Attendance_Manager')
  @Put('clock-out/:id')
  handleClockOut(@Param('id') id: string): any | string {
    return this.employeesService.handleAttendanceClockOut(parseInt(id)) as any || 'Cannot clock out';
  }

  // Both HR and Attendance Manager can handle breaks
  @Roles('HR', 'Attendance_Manager')
  @Put('break-start/:id')
  handleStartBreak(@Param('id') id: string): any | string {
    return this.employeesService.handleStartBreak(parseInt(id)) as any || 'Cannot start break';
  }

  @Roles('HR', 'Attendance_Manager')
  @Put('break-end/:id')
  handleEndBreak(@Param('id') id: string): any | string {
    return this.employeesService.handleEndBreak(parseInt(id)) as any || 'Cannot end break';
  }
}


