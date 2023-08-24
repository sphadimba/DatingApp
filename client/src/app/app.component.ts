import { Component, OnInit } from '@angular/core';
import { AccountService } from './services/account.service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Dating App';  

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {    
    this.setCurrentUser();
  }

 

//method to set current user since this is root component of our application, the one that initialises first.
  setCurrentUser() {
    //const user: User = JSON.parse(localStorage.getItem('user')!);//overriding typescript safety in case we return null, or do this.below
    const userString = localStorage.getItem('user');
    if(!userString) return;
    const user : User = JSON.parse(userString);
    this.accountService.setCurrentUser(user);
  }

}
