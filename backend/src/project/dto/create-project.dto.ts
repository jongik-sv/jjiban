import { IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    key: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    rootPath: string;

    @IsOptional()
    settings?: any;
}
