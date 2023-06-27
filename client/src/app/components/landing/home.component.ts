import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  lottieOptions!: AnimationOptions;

  @ViewChild("main", { static: true }) mainElement!:ElementRef;  

  showLogin = false;
  showSignUp = false;
  isSignedIn = false;

  userUpdates$!: Subscription;

  constructor(private fbAuthSvc: FirebaseauthService, private router: Router) { }
  ngOnDestroy(): void {
    this.userUpdates$.unsubscribe();
  }
  ngOnInit() {
    this.userUpdates$ = this.fbAuthSvc.userAuthState.subscribe((user) => {
      if (user) {
        this.isSignedIn = true;
      }
      else {
        this.isSignedIn = false;
      }
    })
    this.fbAuthSvc.getCurrentUser().then((user) => {
      if (user)
        this.isSignedIn = true;
    });
    this.lottieOptions = {
      path: 'assets/animations/48244-dashboard-data-visualization.json',
      loop: true,
      autoplay: true,
    };
  }

  getStarted() {
    // this.disableBodyScroll();
    this.showSignUp = true;
    this.showLogin = false;
    window.scrollTo({top:0,behavior:"smooth"});
  }
  getLogin() {
    // this.disableBodyScroll();
    this.showLogin = true;
    this.showSignUp = false;
    window.scrollTo({top:0,behavior:"smooth"});
  }
  close() {
    // this.enableBodyScroll();
    this.showLogin = false;
    this.showSignUp = false;
  }

  moveTo(element:HTMLElement){
    element.scrollIntoView(
      {behavior:"smooth"}
    )
  }
  goToTop(){
    this.mainElement.nativeElement.scrollIntoView({
      behavior:"smooth"
    });
  }

  // disableBodyScroll() {
  //   document.body.style.overflow = 'hidden';
  // }

  // enableBodyScroll() {
  //   document.body.style.overflow = 'auto';
  // }

}
