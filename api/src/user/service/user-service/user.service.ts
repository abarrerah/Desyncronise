import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { HttpStatus } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';


@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService:AuthService
    ) {}

    create(newUser: UserI): Observable<UserI> {
        return this.mailExist(newUser.email).pipe(
            switchMap((exists:boolean) => {
                if(!exists) {
                    return this.hashPassword(newUser.password).pipe(
                        switchMap((passwordHashed:string) => {
                            newUser.password = passwordHashed;
                            return from(this.userRepository.save(newUser)).pipe(
                                switchMap((user:UserI) => this.findOne(user.id))
                            );
                        })
                    );
                } else {
                    throw new HttpException('Email is already in use',HttpStatus.CONFLICT);
                }
            })
        );
    }

    login(user: UserI): Observable<string> {
        return this.findByEmail(user.email).pipe(
            switchMap((foundUser:UserI) => {
                if (foundUser) {
                    return this.validatePassword(user.password,foundUser.password).pipe(
                        switchMap((matches: boolean) => {
                            if (matches) {
                                return this.findOne(foundUser.id).pipe(
                                    switchMap((payload: UserI) => this.authService.generateJwt(payload))
                                );
                            } else {
                                throw new HttpException('Login was not succesfull wrong credentials', HttpStatus.UNAUTHORIZED)
                            }
                        })
                    );
                } else {
                    throw new HttpException('User not found',HttpStatus.NOT_FOUND);
                }
            } )
        )
    }

    findAll(options:IPaginationOptions): Observable<Pagination<UserI>> {
        return from(paginate<UserEntity>(this.userRepository,options));
    }

    validatePassword(password:string, storedPasswordHash): Observable<any>  {
        return this.authService.comparePassword(password,storedPasswordHash);
    }
    private hashPassword(password: string): Observable<string> {
        return this.authService.hashPassword(password);
    }

    private findByEmail(email:string): Observable<UserI> {
        return from(this.userRepository.findOne({email},{select: ['id','email','username','password']}));
    }


    private findOne(id:number): Observable<UserI> {
        return from(this.userRepository.findOne({id}));
    }

    private mailExist(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({email})).pipe(
            map((user: UserI) => {
                if(user) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }
}
