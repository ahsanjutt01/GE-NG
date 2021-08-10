import { Injectable } from '@angular/core';

interface Scripts {
  name: string;
  src: string;
}

declare var document: any;
// "./src/assets/js/jquery.slim.min.js",
//               "./src/assets/js/popper.min.js",
// "./src/assets/js/owl.carousel.min.js",
// "./src/assets/js/nouislider.min.js"
export const ScriptStore: Scripts[] = [
  { name: 'slim', src: '../assets/js/jquery.slim.min.js' },
  { name: 'carousel', src: '../assets/js/owl.carousel.min.js' },
  { name: 'nouislider', src: '../assets/js/nouislider.min.js' },
  { name: 'poper', src: '../assets/js/popper.min.js' },
  { name: 'util', src: '../assets/js/util.js' },
  { name: 'collapse', src: '../assets/js/collapse.js' },
  { name: 'dropdown', src: '../assets/js/dropdown.js' },
  { name: 'alert', src: '../assets/js/alert.js' },
  { name: 'modal', src: '../assets/js/modal.js' },
];


@Injectable({
  providedIn: 'root'
})
export class DynamicScriptLoader {
  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  // tslint:disable-next-line: typedef
  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  // tslint:disable-next-line: typedef
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if (!this.scripts[name].loaded) {
        // load script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  // Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }
}
