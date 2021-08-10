import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortDecimal'
})
export class ShortDecimal implements PipeTransform {
    // tslint:disable-next-line: typedef
    transform(val: number, args?: any): string {
        try {
        return parseFloat(val.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2);
        } catch (error) {
            return '0.00';
        }
    }
    constructor() { }
}
