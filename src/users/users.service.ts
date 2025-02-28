import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import * as fs from 'fs';
import * as path from 'path'; 

@Injectable()
export class UsersService{
    private filePath = path.join(process.cwd(), 'data.json'); 

    private readUsers(): User[] {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data) as User[];
        } catch (error) {
            return []; 
        }
    }
      
    private writeUsers(users: User[]): void {
        try {
            console.log("Writing to data.json:", JSON.stringify(users, null, 2)); 
            fs.writeFileSync(this.filePath, JSON.stringify(users, null, 2), 'utf8'); 
            console.log("Write successful!");
        } catch (error) {
            console.error("Error writing to users.json:", error);
        }
    }
    

    getAllUsers(): User[] {
        return this.readUsers();
    }

    getUserById(id: number): User | undefined {
        return this.readUsers().find(user => user.id === id);
    }

    createUser(name: string, email: string): User {
        const users = this.readUsers();
        const newUser: User = { id: users.length + 1, name, email };
        users.push(newUser);
        this.writeUsers(users);
        return newUser;
    }

    updateUser(id: number, name: string, email: string): User | undefined {
        const users = this.readUsers();
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return undefined;

        users[index] = { id, name, email };
        this.writeUsers(users);
        return users[index];
    }

    deleteUser(id: number): string {
        let users = this.readUsers();
        const filteredUsers = users.filter(user => user.id !== id);
        if (users.length === filteredUsers.length) {
            return 'User not found';
        }
        this.writeUsers(filteredUsers);
        return 'User deleted successfully';
    }
}


