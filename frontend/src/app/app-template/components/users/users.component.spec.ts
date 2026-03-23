import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Injectable } from '@angular/core';
import { UsersComponent } from './users.component';

// Lightweight abstract token used only for tests to simulate authentication behavior.
abstract class AuthService {
  abstract getToken(): string | null;
  abstract isAuthenticated(): boolean;
  abstract hasRole(role: string): boolean;
}

@Injectable()
class MockAuthService implements AuthService {
  getToken(): string | null {
    // Simulate a signed JWT used by client-side code during tests.
    return 'mock-jwt-token';
  }

  isAuthenticated(): boolean {
    return true;
  }

  hasRole(_role: string): boolean {
    // In tests we allow all roles; production code should enforce role checks server-side.
    return true;
  }
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create the UsersComponent', () => {
    expect(component).toBeTruthy();
  });
});
