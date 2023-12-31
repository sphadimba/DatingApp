import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../models/pagination';
import { UserParams } from '../models/userParams';
import { useAnimation } from '@angular/animations';
import { AccountService } from './account.service';
import { User } from '../models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User |undefined;
  userParams: UserParams | undefined;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUsers$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.userParams = new UserParams(user);
          this.user = user;
        }
      }
    })
   }

  getUserParams() {
     return this.userParams;
  }

  setUserParams(params: UserParams) {
     this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(UserParams : UserParams) {
    const response = this.memberCache.get(Object.values(UserParams).join('-'));
    
    if (response) return of(response);

    let params = getPaginationHeaders(UserParams.pageNumber, UserParams.pageSize);

    params = params.append('minAge', UserParams.minAge);
    params = params.append('maxAge', UserParams.maxAge);
    params = params.append('gender', UserParams.gender);
    params = params.append('orderBy',UserParams.orderBy);
    //for storing members in the service instead of the component
    //if(this.members.length > 0) return of(this.members) // for caching all users
    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
      map(response => {
        this.memberCache.set(Object.values(UserParams).join('-'), response);
        return response;
      })
    )
  } 

  getMember(username: string) {
    //for Caching
    // const member = this.members.find(x => x.userName === username);
    // if(member) return of(member); 
    //new way of caching   
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username)

    if(member) return of(member);

    return 	this.http.get<Member>(`${this.baseUrl}users/${username}`);
    //return 	this.http.get<Member>(this.baseUrl + 'users/' + username,this.getHttpOptions());
  }

  updateMember(member:Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...member}
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);    
  }

  addLike(username: string) {
    return this.http.post(`${this.baseUrl}likes/`+ username ,{});
  }

  getLikes(predicate: string, pageNumber: number, pageSize : number) {
    let params = getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    //return this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + predicate); previous method without pagination
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.http);
  }

  

  //We are removing this because we are going to use Interceptor to get Jwt token - JwtInterceptor
  // getHttpOptions(){
  //   const userString = localStorage.getItem('user');
  //   if (!userString) return;
  //   const user = JSON.parse(userString);
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization : 'Bearer ' + user.token
  //     })
  //   }
  // }

}
