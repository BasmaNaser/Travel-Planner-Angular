import { Pipe, PipeTransform } from '@angular/core';
import { Idestination } from '../core/models/idestination';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(
    destinations: Idestination[],
    searchText: string
  ): Idestination[] {

    if (!searchText) {
      return destinations;
    }

    return destinations.filter(destination =>
      destination.name.toLowerCase().includes(searchText.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchText.toLowerCase())
    );

  }

}