import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {}
  //loggedIn = false;
  currentUser$: Observable<User | null> = of(null)

  constructor(private accountService: AccountService, private router: Router, 
    private toastr: ToastrService) { }

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
      next : () => this.router.navigateByUrl('/members'),
       // console.log(response);
       //this.loggedIn = true;      
      //error: error => console.log(error)
      error: error => this.toastr.error(error.error)          
    })
  }

  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/');
    //this.loggedIn = false;
  }

}
