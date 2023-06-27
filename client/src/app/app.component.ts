import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from './services/firebaseauth.service';
import { faSocks } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  faSocks = faSocks;
  title = 'client';
  showMenu = false;
  signedIn = false;

  showLogin = false;
  showSignUp = false;
  showProfile = false;
  showFeedback = false;

  username!: string;
  email!: string;

  userUpdates$!: Subscription;

  constructor(private authSvc: FirebaseauthService, private router: Router) { }
  ngOnDestroy(): void {
    this.userUpdates$.unsubscribe();
  }

  ngOnInit() {
    if(!this.signedIn){
      this.userUpdates$ = this.authSvc.userAuthState.subscribe((user) => {
        if (user) {
          this.signedIn = true;
          this.username = user.displayName;
          this.email = user.email;
          // todo change to dashboard once created
          this.router.navigate(['/dashboard']);
        }
        else {
          this.signedIn = false;
          this.router.navigate(['/']);
        }
      })
    }
  }

  logout() {
    const resp = this.authSvc.signOut();
    this.showMenu = true;
    resp.then(() => {
      console.log('User logged out');
    }).catch((error) => {
      console.log('Error logging out');
    });
  }

  getStarted() {
    // this.disableBodyScroll();
    this.showSignUp = true;
    this.showLogin = false;
    this.showMenu = true;
  }
  getLogin() {
    // this.disableBodyScroll();
    this.showLogin = true;
    this.showSignUp = false;
    this.showMenu = true;
  }
  close() {
    // this.enableBodyScroll();
    this.showLogin = false;
    this.showSignUp = false;
    this.showProfile = false;
    this.showFeedback = false;
    this.showMenu = true;
  }
  getProfile() {
    // this.disableBodyScroll();
    this.showProfile = true;
  }
  getFeedback(element:HTMLElement) {
    this.showFeedback = true;
    element.scrollIntoView({behavior: "smooth"});
  }

  // disableBodyScroll() {
  //   document.body.style.overflow = 'hidden';
  // }

  // enableBodyScroll() {
  //   document.body.style.overflow = 'auto';
  // }

}
