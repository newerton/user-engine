import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class IdUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class KafkaIdUserDto {
  @Type(() => IdUserDto)
  @ValidateNested()
  @IsNotEmpty()
  value: IdUserDto;
}
