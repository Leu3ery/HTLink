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
      login: new FormControl<string>("", [Validators.required]),
      password: new FormControl<string>('', [Validators.required]),
    })

  login(){
    if (this.loginForm.valid) {
      console.log(this.loginForm.value)
      this.authService.login(this.loginForm.value as {login:string,password:string})
    }
  }
}
