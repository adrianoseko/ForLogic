import { Component, OnInit } from '@angular/core';
import { UserService } from './users.service';
import { User } from './user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => this.handleUserData(data),
      error: (error) => this.handleError(error)
    });
  }

  private handleUserData(data: User[]): void {
    this.users = data;
    console.log(this.users);
  }

  private handleError(error: any): void {
    console.error('Error fetching users:', error);
  }
}