import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(items: any[], searchText: string): any[] {
        if (!items) { return []; }

        if (!searchText) { return items; }

        // return this.searchItems(items, searchText.toLowerCase());
        // transform(value: any, args?: any): any {
        items = items.filter(search => {
            return search.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
        });
        return items;
        // }
    }

    private searchItems(items: any[], searchText): any[] {
        const results = [];
        items.forEach(it => {
            if (it.name.toLowerCase().includes(searchText)) {
                results.push(it);
            } else {
                const searchResults = this.searchItems(it.items_containers, searchText);
                if (searchResults.length > 0) {
                    results.push({
                        name: it.name,
                        items_containers: searchResults
                    });
                }
            }
        });
        return results;
    }
}
