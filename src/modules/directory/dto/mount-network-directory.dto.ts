import { IsString, IsNotEmpty, IsUrl } from "class-validator";

export class MountNetworkDirectoryDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  networkPath: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
