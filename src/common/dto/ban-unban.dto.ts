import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanUnbanDto {
  @IsNotEmpty()
  @IsBoolean()
  public isBanned: boolean;
}
