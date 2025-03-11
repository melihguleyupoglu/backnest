import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './createUserDto';

export class UpdateuserDto extends PartialType(CreateUserDto) {}
