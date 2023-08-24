import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {}
  //loggedIn = false;
  currentUser$: Observable<User | null> = of(null)

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    //this.getCurrentUser();
    this.currentUser$ = this.accountService.currentUsers$;
  }

 // getcurrentuser() {
  //  this.accountservice.currentusers$.subscribe({
   //   next : user => this.loggedin = !!user, // this !! turns our user object into a boolean, if we have a user it gonna return true and if there is no user it gonna return false.
   //   error: error => console.log(error)      
  //  })
 // }

  login() {
    this.accountService.login(this.model).subscribe({
      next : response => {
        console.log(response);
       //this.loggedIn = true;
      },
      error: error => console.log(error)    
    })
  }

  logout(){
    this.accountService.logout();
    //this.loggedIn = false;
  }

}
