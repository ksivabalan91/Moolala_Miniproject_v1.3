import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginForm!: FormGroup;
  error = false;
  isLoggingIn = false;
  errorMsg = '';

  public resetForm!: FormGroup;
  resetPasswordClicked = false;
  resetEmailSent = false;

  @Output()
  switchToSignUp = new EventEmitter();
  @Output()
  closePopUp = new EventEmitter();

  constructor(private authSvc: FirebaseauthService, private fb: FormBuilder, private router: Router) {
  }
  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.resetForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
    });
    this.loginForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  async login() {
    this.isLoggingIn = true;
    try {
      const response = await this.authSvc.signInWithEmailandPassword(this.loginForm.value.email, this.loginForm.value.password);
      this.isLoggingIn = false;
      this.closepopup();

      this.authSvc.getCurrentUser().then((user) => {
        if (user)
          this.router.navigate(['/dashboard'])
      });

    } catch (err: HttpErrorResponse | any) {
      this.error = true;
      this.errorMsg = err.message;
      this.isLoggingIn = false;
      console.log(err);
    }
  }

  async resetPassword() {
    this.isLoggingIn = true;
    await this.authSvc.resetPassword(this.resetForm.value.email);
    this.isLoggingIn = false;
    this.resetEmailSent = true;
  }

  showSignup() { this.switchToSignUp.emit() }
  closepopup() { this.closePopUp.emit() }

}
