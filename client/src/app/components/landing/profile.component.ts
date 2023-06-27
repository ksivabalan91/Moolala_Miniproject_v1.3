import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, lastValueFrom, timeout } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  @Input()
  username!: string;
  @Input()
  email!: string;

  verified = false;
  verificationSent = false;

  passError = false;
  isSaving = false;
  updateSuccess = false;

  updateForm!: FormGroup;
  userSub$ = new Subscription();

  @Output()
  closePopUp = new EventEmitter();

  constructor(private fbAuthSvc: FirebaseauthService, private fb: FormBuilder, private apiSvc: ApiService) { }

  ngOnDestroy() {
    this.userSub$.unsubscribe();
  }

  ngOnInit() {
    this.userSub$ = this.fbAuthSvc.userAuthState.subscribe((user) => {
      if (user) {
        this.username = user.displayName!;
        this.email = user.email!;
        this.verified = user.emailVerified;
      }
    })
    this.updateForm = this.fb.group({
      displayName: this.fb.control(this.username, [Validators.minLength(6)]),
      password1: this.fb.control('', [Validators.minLength(6)]),
      password2: this.fb.control('', [Validators.minLength(6)])
    })
  }

  async updateProfile() {
    if (this.updateForm.value.displayName != this.username) {
      this.isSaving = true;
      const user = await this.fbAuthSvc.getCurrentUser()
      if (user != null) {
        await user?.updateProfile({ displayName: this.updateForm.value.displayName })
        await this.apiSvc.updateUsername(this.updateForm.value.displayName, user.uid)
      }
    }
    if (this.updateForm.value.password1 != '') {
      const user = await this.fbAuthSvc.getCurrentUser()
      await user?.updatePassword(this.updateForm.value.password1)
    }
    this.isSaving = false;
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
    }, 2000)
  }

  checkPassword() {
    if (this.updateForm.value.password1 != this.updateForm.value.password2)
      this.passError = true;
    else
      this.passError = false;
  }
  async sendVerificationEmail() {
    const promise = await this.fbAuthSvc.verifyEmail(this.email);
    this.verificationSent = true;
  }

  closepopup() { this.closePopUp.emit() }
}
