import { DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShortDecimal } from './shortDecimal.pipe';

@NgModule({
    imports: [],
    declarations: [ShortDecimal],
    exports: [ShortDecimal],
    providers: [
        DecimalPipe
    ]
})

export class PipeModule {

    // tslint:disable-next-line:typedef
    static forRoot() {
        return {
            ngModule: PipeModule,
            providers: [],
        };
    }
}
