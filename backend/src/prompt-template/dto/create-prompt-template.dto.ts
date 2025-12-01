import { IsString, IsOptional, IsArray, IsBoolean, IsObject, IsEnum } from 'class-validator';

export class CreatePromptTemplateDto {
    @IsString()
    @IsOptional()
    projectId?: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    prompt: string;

    @IsString()
    llmType: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    visibleColumns?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    visibleTypes?: string[];

    @IsObject()
    @IsOptional()
    variables?: Record<string, any>;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
