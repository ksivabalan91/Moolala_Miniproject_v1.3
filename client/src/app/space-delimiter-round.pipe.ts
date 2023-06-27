import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceDelimiterRound'
})
export class SpaceDelimiterRoundPipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value !== 'number') {
      return value;
    }
    const formattedValue = Math.floor(value).toString();
    return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
