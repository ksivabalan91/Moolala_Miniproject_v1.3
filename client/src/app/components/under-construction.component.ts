import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-under-construction',
  templateUrl: './under-construction.component.html',
  styleUrls: ['./under-construction.component.scss']
})
export class UnderConstructionComponent implements OnInit{

  @Input()
  path = '/assets/animations/134132-maintenance.json';

  lottieOptions!: AnimationOptions;
  
  ngOnInit(){
    this.lottieOptions = {
      path: this.path,
    };
  }

}
