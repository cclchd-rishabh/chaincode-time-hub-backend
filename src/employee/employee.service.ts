import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from '../database/models/Employee';
import { Attendance } from '../database/models/Attendance';
import { Break } from '../database/models/Breaks';
import { Op, Sequelize } from 'sequelize';
import { start } from 'repl';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee)
    private readonly employeeModel: typeof Employee,

    @InjectModel(Attendance) 
    private readonly attendanceModel: typeof Attendance,

    @InjectModel(Break) 
    private readonly breakModel: typeof Break
  ) {}

  async getEmployeeAttendanceDetails() {
    try {
      const employees = await Employee.findAll({
        attributes: [
          "id", "first_name", "last_name", "email", "avatar", "department", "role", "createdAt",
          [Sequelize.fn("MAX", Sequelize.col("attendances.id")), "attendance_id"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.clock_in")), "clock_in"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.clock_out")), "clock_out"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.status")), "attendance_status"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.total_time")), "total_time"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.total_work_time")), "total_work_time"],
          [Sequelize.fn("MAX", Sequelize.col("attendances.total_break_time")), "total_break_time"],
          [Sequelize.fn("MAX", Sequelize.col("attendances->breaks.id")), "break_id"],
          [Sequelize.fn("MAX", Sequelize.col("attendances->breaks.break_start")), "break_start"],
          [Sequelize.fn("MAX", Sequelize.col("attendances->breaks.break_end")), "break_end"],
          [Sequelize.fn("MAX", Sequelize.col("attendances->breaks.status")), "break_status"]
        ],
        include: [
          {
            model: Attendance,
            as: "attendances",
            attributes: [],
            include: [
              {
                model: Break,
                as: "breaks",
                attributes: []
              }
            ]
          }
        ],
        group: ["Employee.id"],
        order: [["id", "DESC"]],
      });

        console.log("Get all employees details called");

        // Flattening the data
        const flattenedData = employees.map(row => {
            return {
                employee_id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                avatar: row.avatar,
                department: row.department,
                role: row.role,
                employee_created_at: this.formatDate(row.createdAt),
                attendance_id: row['attendanceModel.attendance_id'],
                clock_in: this.formatDate(row['attendanceModel.clock_in']),
                clock_out: this.formatDate(row['attendanceModel.clock_out']),
                attendance_status: row['attendanceModel.attendance_status'],
                break_id: row['attendanceModel.breakModel.break_id'],
                break_start: this.formatDate(row['attendanceModel.breakModel.break_start']),
                break_end: this.formatDate(row['attendanceModel.breakModel.break_end']),
                break_status: row['attendanceModel.breakModel.break_status'],
                total_break_time: row['attendanceModel.total_break_time'],
                total_time: row['attendanceModel.total_time'],
                total_work_time: row['attendanceModel.total_work_time'],
            };
        });
        console.log(flattenedData)
        return flattenedData;
    } catch (error) {
        console.error("Error fetching employee attendance details:", error);
        throw new HttpException("Failed to fetch employee details", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
async getEmployeeAttendanceDetailsDatewise(date: string) {
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
  const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

  const employees = await Employee.findAll({
    attributes: [
      'id',
      'first_name',
      'last_name',
      'email',
      'avatar',
      'department',
      'role',
      'createdAt',
    ],
    include: [
      {
        model: Attendance,
        as: 'attendances',
        required: false,
        attributes: [
          'id',
          'clock_in',
          'clock_out',
          'total_time',
          'total_break_time',
          'total_work_time',
          'status',
        ],
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] }
        },
        include: [
          {
            model: Break,
            as: 'breaks',
            required: false,
            attributes: [
              'id',
              'break_start',
              'break_end',
              'status',
            ],
            separate: true, // loads associations in separate queries
            order: [['break_start', 'DESC']],
            limit: 1,
          },
        ],
        separate: true, // Load attendance separately
        order: [['createdAt', 'DESC']],
        limit: 1,
      },
    ],
    where: {
      createdAt: { [Op.lte]: endOfDay },
    },
  });

  // Transform the results
  return employees.map(employee => {
    const attendance = employee.attendances && employee.attendances.length > 0 
      ? employee.attendances[0] 
      : null;
    
    console.log("DEBUG - attendance for employee ID:", employee.id, ":", JSON.stringify(attendance, null, 2));
    
    const breakDetails = attendance && attendance.breaks && attendance.breaks.length > 0 
      ? attendance.breaks[0] 
      : null;
      
    console.log("DEBUG - break details:", JSON.stringify(breakDetails, null, 2));

    return {
      employee_id: employee.id,
      employee_created_at: employee.createdAt,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      avatar: employee.avatar,
      department: employee.department,
      role: employee.role,

      attendance_id: attendance?.id || null,
      clock_in: attendance?.clock_in || null,
      clock_out: attendance?.clock_out || null,
      total_time: attendance?.total_time || 0,
      total_break_time: attendance?.total_break_time || 0,
      total_work_time: attendance?.total_work_time || 0,
      attendance_status: attendance?.status || null,

      // issue - we need to directly use the break object properties
      break_id: breakDetails?.id || null,
      break_start: breakDetails?.break_start || null,
      break_end: breakDetails?.break_end || null,
      break_status: breakDetails?.status || null,
    };
  });
}
async getEmployeeAttendanceByDateRange(startDate: string, endDate: string) {
  // Parse the dates and create date objects
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  // Set to start of day for start date and end of day for end date
  startDateObj.setHours(0, 0, 0, 0);
  endDateObj.setHours(23, 59, 59, 999);
  
  // Ensure valid date range
  if (startDateObj > endDateObj) {
    throw new BadRequestException('Start date must be before end date');
  }
  
  // Find all employees
  const employees = await Employee.findAll({
    attributes: [
      'id',
      'first_name',
      'last_name',
      'email',
      'avatar',
      'department',
      'role',
      'createdAt',
    ],
    where: {
      createdAt: { [Op.lte]: endDateObj },
    },
    include: [
      {
        model: Attendance,
        as: 'attendances',
        required: false,
        attributes: [
          'id',
          'clock_in',
          'clock_out',
          'total_time',
          'total_break_time',
          'total_work_time',
          'status',
          'createdAt',
        ],
        where: {
          createdAt: { [Op.between]: [startDateObj, endDateObj] }
        },
        include: [
          {
            model: Break,
            as: 'breaks',
            required: false,
            attributes: [
              'id',
              'break_start',
              'break_end',
              'status',
            ],
          },
        ],
      },
    ],
  });

  // Create a map to store results by date and employee
  const attendanceMap = new Map();
  
  // Process all employees
  for (const employee of employees) {
    // For each attendance record of this employee within the date range
    if (employee.attendances && employee.attendances.length > 0) {
      for (const attendance of employee.attendances) {
        // Create a date string for this attendance record
        const attendanceDate = new Date(attendance.createdAt);
        const dateKey = attendanceDate.toISOString().split('T')[0];
        
        // Process breaks for this attendance
        const breakDetails = attendance.breaks && attendance.breaks.length > 0 
          ? attendance.breaks[0] 
          : null;
        
        // Create result object for this employee and date
        const resultKey = `${dateKey}_${employee.id}`;
        
        attendanceMap.set(resultKey, {
          employee_id: employee.id,
          employee_created_at: employee.createdAt,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          avatar: employee.avatar,
          department: employee.department,
          role: employee.role,
          
          attendance_date: dateKey,
          attendance_id: attendance.id,
          clock_in: attendance.clock_in,
          clock_out: attendance.clock_out,
          total_time: attendance.total_time,
          total_break_time: attendance.total_break_time,
          total_work_time: attendance.total_work_time,
          attendance_status: attendance.status,
          
          break_id: breakDetails?.id || null,
          break_start: breakDetails?.break_start || null,
          break_end: breakDetails?.break_end || null,
          break_status: breakDetails?.status || null,
        });
      }
    } else {
      // For employees with no attendance in the date range, create a placeholder entry for each day
      let currentDate = new Date(startDateObj);
      
      while (currentDate <= endDateObj) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const resultKey = `${dateKey}_${employee.id}`;
        
        attendanceMap.set(resultKey, {
          employee_id: employee.id,
          employee_created_at: employee.createdAt,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          avatar: employee.avatar,
          department: employee.department,
          role: employee.role,
          
          attendance_date: dateKey,
          attendance_id: null,
          clock_in: null,
          clock_out: null,
          total_time: 0,
          total_break_time: 0,
          total_work_time: 0,
          attendance_status: null,
          
          break_id: null,
          break_start: null,
          break_end: null,
          break_status: null,
        });
        
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }
  
  // Convert map to array
  console.log("attendance-map" , attendanceMap);
  const arr = Array.from(attendanceMap.values());
  console.log("attendance-map-array" , arr);
  return arr;
}
  private formatDate(date: string | Date | null): string | null {
      if (!date) return null;

      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  async getEmployeeById(id: number): Promise<any> {
    console.log("Fetching employee by ID");

    const employee = await this.employeeModel.findOne({
        where: { id },
        attributes: [
            'id', 'first_name', 'last_name', 'email', 'avatar', 'department', 'role', 
            'createdAt', 'total_time', 'total_break_time', 'total_work_time'
        ],
    });

    return employee;
}


async createEmployee(body: any): Promise<any> {

  
    console.log("Create Employee ke andar");
    try {
      console.log(body);
      const employee = await this.employeeModel.create({
        ...body
      } as Employee); 

      return {
        success: true,
        message: "Employee created successfully",
        data: employee,
      };
    } catch (error: any) {
      console.error("Error creating employee:", error); // Log full error
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new HttpException("Email already exists", HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message || "Failed to create employee", HttpStatus.INTERNAL_SERVER_ERROR);
    

   
    }
  }
  async updateEmployee(
    id: number,
    updateData: Partial<Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>>
  ): Promise<Employee | null> {
    try {
      const employee = await this.employeeModel.findByPk(id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
  
      // If avatar is not provided, remove it from updateData to avoid overwriting
      if (!updateData.avatar) {
        delete updateData.avatar;
      }
  
      await employee.update({
        ...updateData,
        updatedAt: Math.floor(Date.now() / 1000), // Store updated timestamp in Unix format
      });
  
      return employee;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }
  

 
      
  async deleteEmployee(id: number): Promise<{ message: string }> {
          const employeeId = Number(id);
          if (isNaN(employeeId)) {
            throw new HttpException("Invalid employee ID provided", HttpStatus.BAD_REQUEST);
          }
      
          try {
            const employee = await this.employeeModel.findByPk(employeeId);
            if (!employee) {
              throw new HttpException("Employee not found", HttpStatus.NOT_FOUND);
            }
      
            await employee.destroy();
            console.log(`Employee with ID ${employeeId} deleted successfully`);
            return { message: "Deleted from db" };
          } catch (error) {
            console.error("Error deleting employee:", error);
            throw new HttpException("Failed to delete employee", HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
       
        
        
        async handleAttendanceClockIn(id: number): Promise<{ message: string; success: boolean } | string> {
          if (!id || isNaN(id)) {
            console.error(`[ERROR] Invalid employee ID: ${id}`);
            return "Invalid employee ID";
          }
        
          console.log(`\n[LOG] Clock-in request received for Employee ID: ${id}`);
        
          const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp format
        
          try {
            // Check if the employee has already clocked in today
            const existingAttendance = await this.attendanceModel.findOne({
              where: {
                employee_id: id,
                createdAt: {
                  [Op.gte]: new Date().setHours(0, 0, 0, 0), // Start of today
                  [Op.lt]: new Date().setHours(23, 59, 59, 999), // End of today
                },
              },
            });
        
            if (existingAttendance) {
              console.warn(`[WARNING] Employee ID ${id} has already clocked in today.`);
              return { message: "You have already clocked in today.", success: false };
            }
        
            // Insert a new attendance record for today
            const newAttendance = await this.attendanceModel.create({
              employee_id: id,
              clock_in: timestamp,
              clock_out: 0,
              status: "active",
              total_time: 0,
              total_break_time: 0,
              total_work_time: 0,
            }as Attendance);
        
            console.log(`[LOG] Successfully clocked in Employee ID: ${id} at ${timestamp}`);
            return { message: `Clock-in successful for Employee ID: ${id}`, success: true };
        
          } catch (error) {
            console.error(`[ERROR] Exception occurred while handling attendance for Employee ID: ${id}`, error);
            return "Error: An unexpected issue occurred while clocking in.";
          }
        }
        async handleAttendanceClockOut(id: number): Promise<{
          message: string;
          success: boolean;
          totalWorkTime: string;
          totalBreakTime: string; 
          netWorkTime: string;
      } | string> {
          if (!id || isNaN(id)) {
              console.error(`[ERROR] Invalid employee ID: ${id}`);
              return "Invalid employee ID";
          }
          
          const now = Math.floor(Date.now() / 1000); // Unix timestamp format
          console.log(`\n[LOG] Clock-out request received for Employee ID: ${id}`);
          console.log(`[LOG] Generated Local Timestamp: ${now}`);
          
          try {
              // Check if employee has an active clock-in record
              const existingAttendance = await this.attendanceModel.findOne({
                  where: {
                      employee_id: id,
                      clock_out: 0, // Looking for records that haven't been clocked out
                      status: 'active'
                  },
                  include: [{
                      model: Break,
                      as: 'breaks',
                      required: false
                  }]
              });
              
              if (!existingAttendance) {
                  console.warn(`[WARNING] No active clock-in record found for Employee ID ${id}.`);
                  return "No active clock-in record found for today. Please clock in first.";
              }
              
              const attendanceId = existingAttendance.id;
              
              // Check for any ongoing breaks and end them
              const ongoingBreak = await this.breakModel.findOne({
                  where: {
                      attendance_id: attendanceId,
                      status: 'on_break'
                  }
              });
              
              if (ongoingBreak) {
                  ongoingBreak.break_end = now;
                  ongoingBreak.status = 'completed';
                  await ongoingBreak.save();
                  console.log(`[LOG] Automatically ended ongoing break for Employee ID: ${id}`);
              }
              
              // Calculate total break time
              const totalBreakTimeSeconds = await this.calculateTotalBreakTime(attendanceId);
              
              // Calculate work time (clock_out - clock_in - totalBreakTime)
              const totalTimeSeconds = now - existingAttendance.clock_in;
              const totalWorkTimeSeconds = totalTimeSeconds - totalBreakTimeSeconds;
              
              // Format times as strings (HH:MM:SS)
              const formatTime = (seconds: number): string => {
                  const hours = Math.floor(seconds / 3600);
                  const minutes = Math.floor((seconds % 3600) / 60);
                  const secs = seconds % 60;
                  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
              };
              
              const totalWorkTime = formatTime(totalWorkTimeSeconds);
              const totalBreakTime = formatTime(totalBreakTimeSeconds);
              const netWorkTime = formatTime(totalWorkTimeSeconds);
              
              // Update the attendance record with clock_out time and calculated times
              existingAttendance.clock_out = now;
              existingAttendance.status = 'day-over';
              existingAttendance.total_time = totalTimeSeconds;
              existingAttendance.total_work_time = totalWorkTimeSeconds;
              existingAttendance.total_break_time = totalBreakTimeSeconds;
              
              console.log(`[LOG] Updating attendance record ID: ${attendanceId} with clock-out time and calculated times`);
              const updateResult = await existingAttendance.save();
              
              if (!updateResult) {
                  console.error(`[ERROR] Failed to update clock-out for Employee ID: ${id}`);
                  return "Error: Unable to clock out. Please try again.";
              }
              
              console.log(`[LOG] Successfully clocked out Employee ID: ${id} at ${now}`);
              
              return {
                  message: `Clock-out successful for Employee ID: ${id}`,
                  success: true,
                  totalWorkTime,
                  totalBreakTime,
                  netWorkTime
              };
          } catch (error) {
              console.error(`[ERROR] Exception occurred while clocking out Employee ID: ${id}`, error);
              return "Error: An unexpected issue occurred while clocking out.";
          }
      }
      
      // Helper method to calculate total break time for an attendance record
      private async calculateTotalBreakTime(attendanceId: number): Promise<number> {
          const breaks = await this.breakModel.findAll({
              where: {
                  attendance_id: attendanceId,
                  status: 'completed'
              }
          });
          
          let totalBreakTime = 0;
          
          for (const breakRecord of breaks) {
              if (breakRecord.break_start && breakRecord.break_end) {
                  totalBreakTime += (breakRecord.break_end - breakRecord.break_start);
              }
          }
          
          return totalBreakTime;
      }
        
    
      
        async handleStartBreak(id: number) {
          console.log("DEBUG: Received attendanceId from frontend:", id);
          
          try {
            // Verify the attendance record exists before creating a break
            const attendance = await this.attendanceModel.findByPk(id);
            if (!attendance) {
              console.error(`[ERROR] No attendance record found with ID: ${id}`);
              return { message: 'Error: Attendance record not found', success: false };
            }
            
            // Check if there's an ongoing break
            const ongoingBreak = await this.breakModel.findOne({
              where: {
                attendance_id: id,
                status: 'on_break'
              }
            });
            
            if (ongoingBreak) {
              console.warn(`[WARNING] There's already an active break for attendance ID: ${id}`);
              return { message: 'There is already an active break', success: false };
            }
            
            // Create a new break entry
            const now = Math.floor(Date.now() / 1000); // Unix timestamp format
            const newBreak = await this.breakModel.create({
              attendance_id: id,
              break_start: now,
              status: 'on_break'
            } as any);
            
            console.log(`[LOG] Created new break record with ID: ${newBreak.id}`);
            
            // Update attendance status
            attendance.status = 'inactive';
            await attendance.save();
            
            console.log(`Updated attendance status to inactive. ID: ->>${id}`);
            console.log("Break started successfully for attendance ID--->>>", id);
            
            return { message: 'Break started successfully', success: true };
          } catch (error) {
            console.error("Error starting break:", error);
            return { message: 'Error starting break', success: false };
          }
        }

        async handleEndBreak(id: number) {
          console.log("DEBUG: Received attendanceId from frontend for break end:", id);
          
          try {
            // Find the ongoing break for this attendance
            const ongoingBreak = await this.breakModel.findOne({
              where: {
                attendance_id: id,
                status: 'on_break'
              }
            });
            
            if (!ongoingBreak) {
              console.warn(`[WARNING] No active break found for attendance ID: ${id}`);
              return { message: 'No active break found', success: false };
            }
            
            // Update break_end time
            const now = Math.floor(Date.now() / 1000); // Unix timestamp format
            ongoingBreak.break_end = now;
            ongoingBreak.status = 'completed';
            await ongoingBreak.save();
            
            console.log(`[LOG] Updated break record with end time. ID: ${ongoingBreak.id}`);
            
            // Calculate break duration
            const breakDuration = now - ongoingBreak.break_start;
            
            // Restore attendance status and update total break time
            const attendance = await this.attendanceModel.findByPk(id);
            if (attendance) {
              attendance.status = 'active';
              attendance.total_break_time += breakDuration; // Add this break's duration to total
              await attendance.save();
              console.log(`[LOG] Updated attendance status to active and added ${breakDuration}s to total break time. ID: ${id}`);
            }
            
            console.log("Break ended successfully for attendance ID:", id);
            
            return { message: 'Break ended successfully', success: true };
          } catch (error) {
            console.error("Error ending break:", error);
            return { message: 'Error ending break', success: false };
          }
        }
      }