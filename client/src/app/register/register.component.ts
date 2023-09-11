import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  //Used to receive information from parent component in this case Home component
  //@Input() usersFromHomeComponent:any;
  //Used to transfer information from child to parent component
  @Output() cancelRegister = new EventEmitter();
  model:any = {}

  constructor(private accountService: AccountService, private toaster: ToastrService) { }

  ngOnInit(): void {
  }

  register() {
    this.accountService.register(this.model).subscribe({
      next: () => {         
         this.cancel();
      },
      error: error =>  {   
        this.toaster.error(error.error),
        console.log(error);
      }    
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

}
