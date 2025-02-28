import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {Employee} from './employee.model';
@Injectable()
export class EmployeeService {
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
    createEmployee(data: Omit<Employee, 'id' | 'clock_in' | 'clock_out' | 'break_time' | 'last_break_start' | 'total_time' | 'status'>): Employee {
        const employees = this.readEmployees();
        const newEmployee: Employee = {
          id: employees.length + 1,
          ...data,
          clock_in: null,
          clock_out: null,
          break_time: "0 min 0 sec",
          last_break_start: null,
          total_time: null,
          status: "not-present",
        };
        
        employees.push(newEmployee);
        this.writeEmployees(employees);
        return newEmployee;
      }
      updateEmployee(id: number, updates: Partial<Employee>): Employee | undefined {
        const employees = this.readEmployees();
        const index = employees.findIndex(emp => emp.id === id);
        if (index === -1) return undefined;
    
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
      
}
