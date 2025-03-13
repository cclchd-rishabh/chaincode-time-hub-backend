import { Injectable , HttpException,HttpStatus  } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Employee } from './employee.model';


@Injectable()
export class EmployeeService {
    pool: any;

    constructor(private readonly databaseService: DatabaseService) { }
    async getEmployeeAttendanceDetails() {
       const query = `
SELECT 
    e.id AS employee_id, 
    e.first_name, 
    e.last_name, 
    e.email, 
    e.avatar, 
    e.department, 
    e.role, 
    e.created_at AS employee_created_at,
    e.total_time,
    e.total_break_time,
    e.total_work_time,
    MAX(a.id) AS attendance_id, 
    MAX(a.clock_in) AS clock_in, 
    MAX(a.clock_out) AS clock_out, 
    MAX(a.status) AS attendance_status,
    MAX(b.id) AS break_id, 
    MAX(b.break_start) AS break_start, 
    MAX(b.break_end) AS break_end,
     MAX(b.status) AS break_status
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
LEFT JOIN breaks b ON a.id = b.attendance_id
    AND b.break_start = (
        SELECT MAX(break_start) 
        FROM breaks 
        WHERE attendance_id = a.id
    )
GROUP BY e.id
ORDER BY e.id DESC ;

    `;

        // Get connection from DatabaseService
        const result = await this.databaseService.query(query) as any[];
      
        console.log("Get all employees details called");
        // console.log("result ->" ,result);
        // Flattening the data
        const flattenedData = result.map(row => {
            const {
                employee_id, first_name, last_name, email, avatar, department, role, employee_created_at,
                attendance_id, clock_in, clock_out, attendance_status,
                break_id, break_start, break_end , break_status ,total_break_time,total_time,total_work_time
            } = row;
            return {
                employee_id,
                first_name,
                last_name,
                email,
                avatar,
                department,
                role,
                employee_created_at: this.formatDate(employee_created_at),
                attendance_id,
                clock_in: this.formatDate(clock_in),
                clock_out: this.formatDate(clock_out),
                attendance_status,
                break_id,
                break_start: this.formatDate(break_start),
                break_end: this.formatDate(break_end),
                break_status,
                total_break_time,
                total_time,
                total_work_time
            };
        });

        return flattenedData;
    }
    async getEmployeeAttendanceDetailsDatewise(date: string) {
        console.log("Afasdfkjdsajfksadfjlkasfjlkasdglkasdgdsalgoirngadfsgion");
        if (!date) {
            throw new Error("Date parameter is required");
        }
        console.log("Issue encountered");
        const query = `
           SELECT 
    e.id AS employee_id, 
    e.first_name, 
    e.last_name, 
    e.email, 
    e.avatar, 
    e.department, 
    e.role, 
    e.created_at AS employee_created_at,
    e.total_time,
    e.total_break_time,
    e.total_work_time,
    a.id AS attendance_id, 
    a.clock_in, 
    a.clock_out, 
    a.status AS attendance_status,
    b.id AS break_id, 
    b.break_start, 
    b.break_end,
    b.status AS break_status
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id AND DATE(a.created_at) = ?
LEFT JOIN breaks b ON a.id = b.attendance_id
AND b.break_start = (
    SELECT MAX(break_start) 
    FROM breaks 
    WHERE attendance_id = a.id
)
WHERE DATE(e.created_at) <= ? /* Only include employees created on or before the queried date */
ORDER BY e.id DESC ;
        `;
    
        try {
            const result = await this.databaseService.query(query, [date,date]) as any[];
    
            if (result.length === 0) {
                console.log("No attendance records found for this date:", date);
                return []; // Return empty array if no data
            }
            console.log("Get employees datewise");
            console.log("Attendance result ->", result);
    
            return result.map(row => ({
                employee_id: row.employee_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                avatar: row.avatar,
                department: row.department,
                role: row.role,
                employee_created_at: this.formatDate(row.employee_created_at),
                attendance_id: row.attendance_id,
                clock_in: this.formatDate(row.clock_in),
                clock_out: this.formatDate(row.clock_out),
                attendance_status: row.attendance_status,
                break_id: row.break_id,
                break_start: this.formatDate(row.break_start),
                break_end: this.formatDate(row.break_end),
                break_status: row.break_status,
                total_break_time: row.total_break_time,
                total_time: row.total_time,
                total_work_time: row.total_work_time
            }));
    
        } catch (error) {
            console.error("Error fetching attendance details:", error);
            throw new Error("Failed to fetch attendance details");
        }
    }

    private formatDate(date: string | Date | null): string | null {
        if (!date) return null;

        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
            `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
    async getEmployeeById(id: number): Promise<any> {
        console.log("aayaaa");
        const query = `
        SELECT 
            e.id AS employee_id, 
            e.first_name, 
            e.last_name, 
            e.email, 
            e.avatar, 
            e.department, 
            e.role, 
            e.created_at AS employee_created_at,
            e.total_time,
            e.total_break_time,
            e.total_work_time,
            a.id AS attendance_id, 
            a.clock_in, 
            a.clock_out, 
            a.status AS attendance_status,
            b.id AS break_id, 
            b.break_start, 
            b.break_end,
            b.status AS break_status

        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employee_id
        LEFT JOIN breaks b ON a.id = b.attendance_id
        WHERE e.id = ?;
    `;
        console.log("Get employees by id");
        const [rows] = await this.databaseService.query(query, [id]) as any[]
        // console.log("rows -> ", [rows]);
        return rows;
    }
    async createEmployee(body: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>): Promise<any> {
        const query = `
            INSERT INTO employees (first_name, last_name, email, avatar, department, role)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const { first_name, last_name, email, avatar, department, role } = body;
    
        try {
            const result = await this.databaseService.query(query, [first_name, last_name, email, avatar, department, role]) as { insertId: number };
    
            return {
                success: true,
                message: "Employee created successfully",
                data: {
                    id: result.insertId,
                    ...body,
                },
            };
        } catch (error) {
            console.error("Error creating employee:", error);
    
            // Handle specific SQL errors (e.g., duplicate email)
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpException("Email already exists", HttpStatus.CONFLICT);
            }
    
            // Handle general database errors
            throw new HttpException("Failed to create employee", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleBreaks(id: number, updates: Partial<Employee>): Promise<Employee | string> {
        if (!id || isNaN(id)) {
            return "Invalid Employee ID";
        }
        console.log("HandleBreak");
        console.log(updates);
        
        const timestamp = new Date();
        const mysqlTimestamp = timestamp.toISOString().slice(0, 19).replace("T", " ");
        const attendanceRecords = await this.databaseService.query(
            `SELECT id FROM attendance WHERE employee_id = ?`,
            [id]
        ) as any[];
        console.log("attendance - >" , attendanceRecords);
        if (attendanceRecords.length === 0) {
            console.log("Error")
            return `Error: No attendance record found for id = ${id}`;
        }
        // console.log(updates.attendance_id)
    
        if (updates.status == 'inactive') {
            console.log("Break started");
    
            await this.databaseService.query(
                `INSERT INTO breaks (attendance_id, break_start) VALUES (?,?)`,
                [ id, mysqlTimestamp]
            );
    
            await this.databaseService.query(
                `UPDATE attendance SET status = 'inactive' WHERE id = ?`,
                [id]
            );
    
            return { id, break_start: mysqlTimestamp, status: "inactive" } as any;
        } else {
            
            const [lastBreak] = await this.databaseService.query(
                `SELECT id FROM breaks WHERE attendance_id = ? AND break_end IS NULL ORDER BY id DESC LIMIT 1`,
                [id]
            ) as any[];
    
            if (!lastBreak) {
                return "Error: No active break found to end.";
            }
    
            const breakId = lastBreak.id;
    
            await this.databaseService.query(
                `UPDATE breaks SET break_end = ? WHERE id = ?`,
                [mysqlTimestamp, breakId]
            );
    
            await this.databaseService.query(
                `UPDATE attendance SET status = 'active' WHERE id = ?`,
                [id]
            );
    
            return { id, break_end: mysqlTimestamp, status: "active" } as any;
        }
    }
    async handleAttendanceClockOut(id: number): Promise<{ 
        message: string; 
        success: boolean;
        totalWorkTime: string;
        totalBreakTime: string;netWorkTime: string;} | string> {
        
        if (!id || isNaN(id)) {
            console.error(`[ERROR] Invalid employee ID: ${id}`);
            return "Invalid employee ID";
        }
    
        // Generate MySQL timestamp
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const timestamp = new Date(now.getTime() - offset).toISOString().slice(0, 19).replace("T", " ");
    
        console.log(`\n[LOG] Clock-out request received for Employee ID: ${id}`);
        console.log(`[LOG] Generated Local Timestamp: ${timestamp}`);
    
        try {
            // Check if employee has clocked in today
            const checkAttendanceQuery = `SELECT id FROM attendance WHERE employee_id = ? AND date = CURDATE() AND clock_out IS NULL`;
            console.log(`[QUERY] ${checkAttendanceQuery} | Params: [${id}]`);
    
            const existingAttendance = await this.databaseService.query(checkAttendanceQuery, [id]) as any[];
    
            if (existingAttendance.length === 0) {
                console.warn(`[WARNING] No active clock-in record found for Employee ID ${id}.`);
                return "No active clock-in record found for today. Please clock in first.";
            }
    
            const attendanceId = existingAttendance[0].id;
    
            //  Update attendance table with `clock_out`
            const updateAttendanceQuery = `
                UPDATE attendance SET clock_out = ?, status = 'day-over' WHERE id = ?
            `;
            console.log(`[QUERY] ${updateAttendanceQuery} | Params: [${timestamp}, ${attendanceId}]`);
    
            const updateResult = await this.databaseService.query(updateAttendanceQuery, [timestamp, attendanceId]);
    
            if (!updateResult || (updateResult as any).affectedRows === 0) {
                console.error(`[ERROR] Failed to update clock-out for Employee ID: ${id}`);
                return "Error: Unable to clock out. Please try again.";
            }
    
            console.log(`[LOG] Successfully clocked out Employee ID: ${id} at ${timestamp}`);
    
            //  Use utility function to calculate work and break time
            const { totalBreakTime, totalWorkTime, netWorkTime } = await this.calculateWorkTime(attendanceId);
            
            const updateTotalTimeQuery = `
            UPDATE employees SET total_time = ? , total_work_time = ? , total_break_time = ? WHERE id = ? `
            const updateTotalTimeQueryResult = await this.databaseService.query(updateTotalTimeQuery,[netWorkTime,totalWorkTime, totalBreakTime ,id])
            
            if (!updateTotalTimeQueryResult || (updateTotalTimeQueryResult as any).affectedRows === 0) {
                console.error(`[ERROR] Failed to update total-time , total-work-time , total-break-time for Employee ID: ${id}`);
                return "Error: Unable to update time. Please try again.";
            }
           
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
    async handleAttendanceClockIn(id: number): Promise<{ message: string; success: boolean } | string> {
        if (!id || isNaN(id)) {
            console.error(`[ERROR] Invalid employee ID: ${id}`);
            return "Invalid employee ID";
        }
    
        // Generate timestamp in MySQL-compatible format (YYYY-MM-DD HH:MM:SS)
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000; // Convert offset from minutes to milliseconds
        const timestamp = new Date(now.getTime() - offset).toISOString().slice(0, 19).replace("T", " ");
    
        console.log(`\n[LOG] Clock-in request received for Employee ID: ${id}`);
        console.log(`[LOG] Generated Local Timestamp: ${timestamp}`);
    
        try {
            // Check if the employee has already clocked in today
            const checkAttendanceQuery = `SELECT id FROM attendance WHERE employee_id = ? AND date = CURDATE()`;
            console.log(`[QUERY] ${checkAttendanceQuery} | Params: [${id}]`);
    
            const existingAttendance = await this.databaseService.query(checkAttendanceQuery, [id]) as any[];
    
            if (existingAttendance.length > 0) {
                console.warn(`[WARNING] Employee ID ${id} has already clocked in today.`);
                return "You have already clocked in today.";
            }
    
            // Insert a new attendance record for today
            const insertAttendanceQuery = `
                INSERT INTO attendance (employee_id, date, clock_in, status)
                VALUES (?, CURDATE(), ?, 'active')
            `;
            console.log(`[QUERY] ${insertAttendanceQuery} | Params: [${id}, ${timestamp}]`);
    
            const insertResult = await this.databaseService.query(insertAttendanceQuery, [id, timestamp]);
            console.log(`[DEBUG] Insert result:`, insertResult);
    
            if (!insertResult || (insertResult as any).affectedRows === 0) {
                console.error(`[ERROR] Failed to insert attendance record for Employee ID: ${id}`);
                return "Error: Unable to clock in. Please try again.";
            }
    
            console.log(`[LOG] Successfully clocked in Employee ID: ${id} at ${timestamp}`);
            return { message: `Clock-in successful for Employee ID: ${id}`, success: true };
    
        } catch (error) {
            console.error(`[ERROR] Exception occurred while handling attendance for Employee ID: ${id}`, error);
            return "Error: An unexpected issue occurred while clocking in.";
        }
    }
    async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | null> {
        
        const employeeId = Number(id);
        if (isNaN(employeeId)) {
            throw new Error("Invalid employee ID provided");
        }
    
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(', ');
    
        if (!fields) return null;
    
        const values = Object.values(updates);
        values.push(employeeId); // Ensure a valid number is pushed
    
        const query = `
            UPDATE employees 
            SET ${fields} 
            WHERE id = ?
        `;
    
        console.log("Generated Query:", query);
        console.log("Query Values:", values);
    
        const [rows]: any = await this.databaseService.query(query, values);
        console.log("Query Result:", rows);
        console.log("editing emp in db");
        return rows.affectedRows > 0 ? { id: employeeId, ...updates } as Employee : null;
    }
    async deleteEmployee(id:number):Promise<void | string>{
        const query = `DELETE from employees WHERE employees.id=?;`;
        const res = await this.databaseService.query(query,[id]) as any[]
       console.log("Deleted");
       return {message : "Deleted from db"} as any ;
    }
    async calculateWorkTime(attendanceId: number): Promise<{ 
        totalBreakTime: string; 
        totalWorkTime: string; 
        netWorkTime: string; 
    }> {
        // Fetch all break records for the given attendance ID
        const getBreaksQuery = `
            SELECT break_start, break_end FROM breaks 
            WHERE attendance_id = ? AND break_start IS NOT NULL AND break_end IS NOT NULL
        `;
        console.log(`[QUERY] ${getBreaksQuery} | Params: [${attendanceId}]`);
    
        const breaks = await this.databaseService.query(getBreaksQuery, [attendanceId]) as { 
            break_start: string; 
            break_end: string; 
        }[];
    
        let totalBreakTimeMs = 0;
    
        if (breaks.length > 0) {
            breaks.forEach(breakEntry => {
                const breakStart = new Date(breakEntry.break_start);
                const breakEnd = new Date(breakEntry.break_end);
                totalBreakTimeMs += (breakEnd.getTime() - breakStart.getTime());
            });
        }
    
        // Convert break time to HH:MM:SS format
        const totalBreakTime = new Date(totalBreakTimeMs).toISOString().substr(11, 8);
    
        // Fetch clock-in and clock-out times from attendance table
        const getAttendanceQuery = `
            SELECT clock_in, clock_out FROM attendance WHERE id = ?
        `;
        console.log(`[QUERY] ${getAttendanceQuery} | Params: [${attendanceId}]`);
    
        const attendance = await this.databaseService.query(getAttendanceQuery, [attendanceId]) as { 
            clock_in: string; 
            clock_out: string; 
        }[];
    
        if (attendance.length === 0) {
            throw new Error("Attendance record not found.");
        }
    
        const clockInTime = new Date(attendance[0].clock_in);
        const clockOutTime = new Date(attendance[0].clock_out);
    
        // Calculate total work duration
        const totalWorkTimeMs = clockOutTime.getTime() - clockInTime.getTime();
        const totalWorkTime = new Date(totalWorkTimeMs).toISOString().substr(11, 8);
    
        //  Compute net work time (totalWorkTime - totalBreakTime)
        const netWorkTimeMs = totalWorkTimeMs - totalBreakTimeMs;
        const netWorkTime = new Date(netWorkTimeMs).toISOString().substr(11, 8);
    
        return { totalBreakTime, totalWorkTime, netWorkTime };
    }
    
    async handleStartBreak(id: number) {
        console.log("DEBUG: Received attendanceId from frontend:", id);
        
        // Insert a new break entry
        const insertQuery = `INSERT INTO breaks (attendance_id, break_start, status) VALUES (?, NOW(), 'on_break')`;
        await this.databaseService.query(insertQuery, [id]);
    
        // Update attendance status
        const updateAttendanceQuery = `UPDATE attendance SET status = 'inactive' WHERE id = ?`;
        console.log(`[QUERY] ${updateAttendanceQuery} | Params: [${id}]`);
        await this.databaseService.query(updateAttendanceQuery, [id]);
    
        console.log("Break started successfully for attendance ID:", id);
        return { message: 'Break started successfully' };
    }
    async handleEndBreak(id: number) {
        console.log("DEBUG: Received attendanceId from frontend for break end:", id);
    
        // Update break_end time for the latest break record
        const updateBreakQuery = `UPDATE breaks SET break_end = NOW(), status = 'completed' WHERE attendance_id = ? AND break_end IS NULL`;
        console.log(`[QUERY] ${updateBreakQuery} | Params: [${id}]`);
        await this.databaseService.query(updateBreakQuery, [id]);
    
        // Restore attendance status
        const updateAttendanceQuery = `UPDATE attendance SET status = 'active' WHERE id = ?`;
        console.log(`[QUERY] ${updateAttendanceQuery} | Params: [${id}]`);
        await this.databaseService.query(updateAttendanceQuery, [id]);
    
        console.log("Break ended successfully for attendance ID:", id);
        return { message: 'Break ended successfully' };
    }

}


