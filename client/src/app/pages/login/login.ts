import {Component, inject} from '@angular/core';
import {Block} from '@shared/ui/block/block';
import {AuthService} from '@core/services/auth.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    Block,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  authService = inject(AuthService)
    loginForm = new FormGroup({
      email: new FormControl<string>("", [Validators.required]),
      code: new FormControl<string>('', [Validators.required]),
    })

  login(){
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value as {email:string,code:string})
    }
  }

  sendVerificationCode() {
    console.log("Sending verification code to ", this.loginForm.value.email);
    this.authService.askForCode({email: this.loginForm.value.email} as {email:string})
  }
}
