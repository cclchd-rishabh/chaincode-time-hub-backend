import { Controller,Get,Post,Put,Delete,Param,Body } from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from './user.model';

@Controller('users')
export class UsersController {
    
    constructor(private readonly usersService:UsersService){}

    @Get()
    getAllUsers():User[]{
        return this.usersService.getAllUsers();
    }
    @Get(':id')
    getUserById(@Param('id')id:string):User|string{
        return this.usersService.getUserById(parseInt(id))||"User not found";
    }
    @Post()
    createUser(@Body() body: { name: string; email: string }): User {
        console.log('Received Body:', body); // Debugging log
        if (!body || !body.name || !body.email) {
            throw new Error('Invalid request body');
        }
        return this.usersService.createUser(body.name, body.email);
    }
    
    @Put(':id')
    updateUser(@Param('id')id:string,@Body()body:{name:string;email:string}):User|string{
        return this.usersService.updateUser(parseInt(id),body.name,body.email)||"User not found";
    }
    @Delete(':id')
    deleteUser(@Param('id')id:string):string{
        return this.usersService.deleteUser(parseInt(id));
    }

}
