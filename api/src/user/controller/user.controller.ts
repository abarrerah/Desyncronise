import { Body, Controller, Post } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {

    constructor( private userService: UserService){}

    @Post()
    create(@Body() createUserDto:CreateUserDto): Observable<Boolean> {
        return of(true);
    }
}
