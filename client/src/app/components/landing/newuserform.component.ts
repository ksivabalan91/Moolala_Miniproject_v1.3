import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, lastValueFrom } from 'rxjs';
import { User } from 'src/app/Shared/Models/User.model';
import { ApiService } from 'src/app/services/api.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-newuserform',
  templateUrl: './newuserform.component.html',
  styleUrls: ['./newuserform.component.scss']
})
export class NewuserformComponent {
  public signupForm!: FormGroup;
  error = false;
  errorMsg = '';
  loginError = false;
  passError = false;
  isLoggingIn = false;
  @Output()
  switchToLogin = new EventEmitter();
  @Output()
  closePopUp = new EventEmitter();

  constructor(private authSvc: FirebaseauthService, private fb: FormBuilder, private router: Router, private apiSvc: ApiService) { }

  ngOnInit() {
    this.signupForm = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password1: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      password2: this.fb.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  checkPassword() {
    if (this.signupForm.value.password1 != this.signupForm.value.password2)
      this.passError = true;
    else
      this.passError = false;
  }

  createNewUser() {
    this.isLoggingIn = true;

    this.authSvc.createUserWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password1)
      .then(async (userCredential) => {
        console.log(userCredential);
        const user = userCredential.user;
        await user?.updateProfile({
          displayName: this.signupForm.value.username
        });
        console.log(user)
        await user?.sendEmailVerification();
        return await userCredential.user?.getIdTokenResult();
      })
      .then(async (idTokenResult) => {
        return await this.apiSvc.createNewUser(new User(idTokenResult?.claims['user_id'], this.signupForm.value.username, this.signupForm.value.email));
      })
      .then((user) => {
        this.isLoggingIn = false;
        console.log(user);
        this.closepopup();
        this.router.navigate(['/dashboard'])
      })
      .catch((error) => {
        this.errorMsg = error.message;
        this.isLoggingIn = false;
        this.loginError = true;
      });
  }

  showLogin() { this.switchToLogin.emit() }
  closepopup() { this.closePopUp.emit() }

}
