import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../database/database.service';
import {Employee} from './employee.model';

@Injectable()
export class EmployeeService {

    constructor(private readonly databaseService: DatabaseService) {}

    private filePath = path.join(process.cwd(), 'employee.json');
    private readEmployees():Employee[]{
        try{
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data) as Employee[];
        }catch(error){
            return [];
        }
    }

    private writeEmployees(employees:Employee[]):void{
        try{
            console.log("Writing to employee.json:", JSON.stringify(employees, null, 2));
            fs.writeFileSync(this.filePath, JSON.stringify(employees, null, 2), 'utf8');
            console.log("Write successful!");
        }catch(error){
            console.error("Error writing to employee.json:", error);
        }   
    }
    getAllEmployees():Employee[]{
            return this.readEmployees();
    }
    getEmployeeById(id:number):Employee | undefined{
        return this.readEmployees().find(employees=>employees.id ===id);
    }
    createEmployee(data: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' |'break_Start'|'break_end'|'break_total'| 'total_time' | 'status'>): Employee {
        const employees = this.readEmployees();
        const newEmployee: Employee = {
          id: employees.length + 1,
          ...data,
          clock_in: null,
          clock_out: null,
          break_start:  null,
          break_end: null, 
          break_total: null,
          total_time: null,
          status: "not-present",
        };
        
        employees.push(newEmployee);
        this.writeEmployees(employees);
        return newEmployee;
      }
      updateEmployee(id: number, updates: Partial<Employee>): Employee | undefined {
        const data = updates;
        const employees = this.readEmployees();
        const index = employees.findIndex(emp => emp.id === id);
        if (index === -1) return undefined;
        const employee = employees[index];
    
        // Handle break start
        if (data.status === 'inactive' && !employee.breakToggle) {
            data.break_start = new Date().toISOString();
            data.breakToggle = true;
        } 
        // Handle break end/resume
        else if (data.breakToggle === false && employee.breakToggle && employee.break_start) {
            const breakStart = new Date(employee.break_start);
            const breakEnd = new Date();
            const breakDiff = breakEnd.getTime() - breakStart.getTime();
            const breakHours = Math.floor(breakDiff / 1000 / 60 / 60);
            const breakMinutes = Math.floor(breakDiff / 1000 / 60) % 60;
            const breakSeconds = Math.floor(breakDiff / 1000) % 60;
            const newBreakTotal = `${breakHours} hr ${breakMinutes} min ${breakSeconds} sec`;
            data.break_total = this.addBreakTimes(employee.break_total, newBreakTotal);
            data.break_end = breakEnd.toISOString();
        }
    
        // Handle clock out and total time calculation
        if (data.clock_out && employee.clock_in) {
            const clockIn = new Date(employee.clock_in);
            const clockOut = new Date(data.clock_out);
            
            // Ensure break_total is defined before using it
            const breakTime = employee.break_total ? this.parseBreakTime(employee.break_total) : 0;
            
            // Calculate total work time (clock out - clock in - break time)
            const totalTime = clockOut.getTime() - clockIn.getTime();
            const netTime = Math.max(0, totalTime - breakTime); // Ensure it's never negative
            
            const hours = Math.floor(netTime / 1000 / 60 / 60);
            const minutes = Math.floor((netTime / 1000 / 60) % 60);
            const seconds = Math.floor((netTime / 1000) % 60);
            
            data.total_time = `${hours} hr ${minutes} min ${seconds} sec`;
        }
    
        // Additional validation for break end calculation
        if (data.break_end && employee.break_start) {
            const breakStart = new Date(employee.break_start);
            const breakEnd = new Date(data.break_end);
            
            // Validate the dates are in correct order
            if (breakEnd >= breakStart) {
                const breakDiff = breakEnd.getTime() - breakStart.getTime();
                const breakHours = Math.floor(breakDiff / 1000 / 60 / 60);
                const breakMinutes = Math.floor((breakDiff / 1000 / 60) % 60);
                const breakSeconds = Math.floor((breakDiff / 1000) % 60);
                const newBreakTotal = `${breakHours} hr ${breakMinutes} min ${breakSeconds} sec`;
                data.break_total = this.addBreakTimes(employee.break_total, newBreakTotal);
            }
        }
    
        console.log(updates);
        employees[index] = { ...employees[index], ...updates };
        this.writeEmployees(employees);
        return employees[index];
      }
      deleteEmployee(id: number): string {
        const employees = this.readEmployees();
        const filteredEmployees = employees.filter(emp => emp.id !== id);
        if (employees.length === filteredEmployees.length) return 'Employee not found';
    
        this.writeEmployees(filteredEmployees);
        return 'Employee deleted successfully';
      }
      
      private parseBreakTime(breakTime: string | null): number {
        if (!breakTime) return 0;
        
        const parts = breakTime.split(' ');
        let totalMs = 0;
        
        for (let i = 0; i < parts.length; i += 2) {
          if (i + 1 >= parts.length) break; // Safety check for unpaired values
          
          const value = parseInt(parts[i]);
          const unit = parts[i + 1];
          
          if (isNaN(value)) continue;
          
          if (unit.startsWith('hr')) {
            totalMs += value * 60 * 60 * 1000;
          } else if (unit.startsWith('min')) {
            totalMs += value * 60 * 1000;
          } else if (unit.startsWith('sec')) {
            totalMs += value * 1000;
          }
        }
        
        return totalMs;
      }

    private addBreakTimes(existingBreakTotal: string | null, newBreakTotal: string): string {
        const existingBreakTime = this.parseBreakTime(existingBreakTotal);
        const newBreakTime = this.parseBreakTime(newBreakTotal);
        const totalBreakTime = existingBreakTime + newBreakTime;
        
        const hours = Math.floor(totalBreakTime / 1000 / 60 / 60);
        const minutes = Math.floor((totalBreakTime / 1000 / 60) % 60);
        const seconds = Math.floor((totalBreakTime / 1000) % 60);
        
        return `${hours} hr ${minutes} min ${seconds} sec`;
    }
}