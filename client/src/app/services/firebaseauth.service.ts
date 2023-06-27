import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseauthService {
  
  userAuthState: Observable<any> = this.fbauth.authState;
  
  constructor(private fbauth: AngularFireAuth) {
  }

  signInWithEmailandPassword(email: string, password: string) {
    return this.fbauth.signInWithEmailAndPassword(email, password);
  } 
  
  signOut(){
    return this.fbauth.signOut();
  }  
  
  getCurrentUser(){
    return this.fbauth.currentUser;
  }
  
  createUserWithEmailAndPassword(email: string, password: string) {
    return this.fbauth.createUserWithEmailAndPassword(email, password);
  }
  
  resetPassword(email: string){
    return this.fbauth.sendPasswordResetEmail(email);
  }

  async verifyEmail(email:string){
    const user = await this.fbauth.currentUser
    return user?.sendEmailVerification();
  }

}
