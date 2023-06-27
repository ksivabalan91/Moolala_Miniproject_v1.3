import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimationOptions, LottieOptions } from 'ngx-lottie/lib/symbols';
import { User } from 'src/app/Shared/Models/User.model';
import { ApiService } from 'src/app/services/api.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  public feedbackForm!: FormGroup;
  error = false;
  errorMsg = '';
  loginError = false;
  passError = false;
  feedbackSent = false;

  userId!: string;
  userEmail!: string|null;
  characters: number = 0;
  options!: AnimationOptions;

  @Output()
  closePopUp = new EventEmitter();

  constructor(private fbAuthSvc: FirebaseauthService, private fb: FormBuilder, private router: Router, private apiSvc: ApiService) { }

  ngOnInit() {
    this.fbAuthSvc.getCurrentUser().then((user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email;
      }
    });

    this.options = {
      path: "assets/animations/74694-confetti.json",
      loop: false
    }

    this.feedbackForm = this.fb.group({
      category: this.fb.control('', Validators.required),
      comments: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(500)])
    });
  }

  submitFeedback() {
    // this.isSendingFeedback = true;
    console.log(this.feedbackForm.value.category)
    console.log(this.feedbackForm.value.comments);
    this.apiSvc.postFeedback(this.feedbackForm.value.category,this.feedbackForm.value.comments, this.userId).then((result) => {console.log(result)});
    this.feedbackSent = true;
  }

  characterCount() {
    this.characters = this.feedbackForm.value.comments.length;    
  }

  closepopup() { this.closePopUp.emit() }

}
