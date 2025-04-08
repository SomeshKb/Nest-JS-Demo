import { IsString, IsNotEmpty } from "class-validator";

export class MountNetworkDirectoryDto {
  @IsString()
  @IsNotEmpty()
  networkPath: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  mountPoint: string;
}
