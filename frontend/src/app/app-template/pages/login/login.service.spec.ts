import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let loginService: LoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginService]
    });
    loginService = TestBed.inject(LoginService);
  });

  it('should be created', () => {
    expect(loginService).toBeTruthy();
  });
});
