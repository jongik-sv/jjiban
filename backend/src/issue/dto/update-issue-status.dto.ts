import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIssueStatusDto {
    @ApiProperty({ example: 'in_progress', description: 'New status of the issue' })
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiProperty({ example: 1, description: 'Order of the issue in the column', required: false })
    @IsNumber()
    @IsOptional()
    order?: number;
}
