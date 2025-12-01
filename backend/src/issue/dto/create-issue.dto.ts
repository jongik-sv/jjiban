import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssueDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiProperty({ required: false, default: 'medium' })
    @IsString()
    @IsOptional()
    priority?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;
}

