import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl =  'https://localhost:7200/api/';
 //private currentUserSource = new BehaviorSubject<User>(null); this return error it complaining bcoz since we made it null coz we wont know the info til we check 
  private currentUserSource = new BehaviorSubject<User | null>(null);// this uses pipe key and union, this means it can be type User or null.
  currentUsers$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  login(model:any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response:User) => {
        const user = response;
        if(user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
      ) 
  }

  register(model:any){
    return this.http.post<User>(this.baseUrl + 'account/register',model).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    )
  }

  setCurrentUser(user: User) {
    this.currentUserSource.next(user);
  }

  logout(){
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
}