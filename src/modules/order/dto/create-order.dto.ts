import { ApiProperty } from "@nestjs/swagger"
import { ArrayNotEmpty, IsArray, IsNotEmpty } from "class-validator"

export class CreateOrderDto {

    @ApiProperty({ type: "array", example: [{ productId: "Product Id", quantity: 10 }], description: 'The items of the Order' })
    @IsArray()
    @ArrayNotEmpty()
    items: OrderItems[]
}
export interface OrderItems {
    productId: number,
    quantity: number
}