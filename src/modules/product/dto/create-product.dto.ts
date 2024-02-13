import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProductDto {
    @ApiProperty({ type: "string", example: "Product Name", description: 'The name of the Product' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ type: "integer", example: 10, description: 'The stock of the Product' })
    @IsNotEmpty()
    price: number;

    @ApiProperty({ type: "integer", example: 10, description: 'The stock of the Product' })
    @IsNotEmpty()
    stock: number;

    @ApiProperty({ type: "string", example: "Product Description", description: 'The description of the Product' })
    @IsOptional()
    @IsString()
    description: string;
}
