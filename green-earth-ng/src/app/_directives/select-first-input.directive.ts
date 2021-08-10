import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSelectFirstInput]'
})
export class SelectFirstInputDirective implements AfterViewInit {

  constructor(private eRef: ElementRef, private renderer: Renderer2) { }

  private _getInputElement(nativeElement: any): any {
    if (!nativeElement || !nativeElement.children) { return undefined; }
    if (!nativeElement.children.length && nativeElement.localName === 'input' && !nativeElement.hidden) { return nativeElement; }

    let input;

    [].slice.call(nativeElement.children).every(c => {
      input = this._getInputElement(c);
      if (input) { return false; } // break
      return true; // continue!
    });

    return input;
  }

  ngAfterViewInit(): any {
    const formChildren = [].slice.call(this.eRef.nativeElement.children);

    formChildren.every(child => {
      const input = this._getInputElement(child);

      if (input) {
        // this.renderer.invokeElementMethod(input, 'focus', []);
        (input as any).focus.apply(input, []);
        return false; // break!
      }

      return true; // continue!
    });
  }
}
