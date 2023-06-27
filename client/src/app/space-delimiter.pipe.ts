import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceDelimiter'
})
export class SpaceDelimiterPipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value !== 'number') {
      return value;
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

}
