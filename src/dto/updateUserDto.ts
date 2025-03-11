import { IsString, MinLength } from 'class-validator';
export class UpdateUserDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
