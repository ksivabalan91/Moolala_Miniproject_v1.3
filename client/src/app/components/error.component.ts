import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export default class ErrorComponent implements OnInit {

  @Input()
  path = '/assets/animations/98488-bot-error-404.json';

  lottieOptions!: AnimationOptions;

  ngOnInit() {
    this.lottieOptions = {
      path: this.path,
    };
  }

}
