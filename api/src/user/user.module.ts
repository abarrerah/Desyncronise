import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserEntity } from './model/user.entity';
import { UserService } from './service/user-service/user.service';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService]
})
export class UserModule {}
