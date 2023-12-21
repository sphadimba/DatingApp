import { Injectable, inject } from '@angular/core';
import {  CanDeactivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { ConfirmService } from '../services/confirm.service';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
  constructor(private confirmService: ConfirmService) {}

  canDeactivate(
    component: MemberEditComponent
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
     // const confirmService = inject(ConfirmService);

      if (component.editForm?.dirty) {
        return this.confirmService.confirm();
      }
      
    return true;
  }
  
}
