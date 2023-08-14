import { Component, OnInit } from '@angular/core';
import { UserService } from './users.service';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any;

  constructor(private userService: UserService,) { }

  ngOnInit(): void {
    this.getClient()
  }

  getClient() {
    this.userService.getUsers().subscribe(
      data => { console.log(data), this.users = data }
    )
  }

}
