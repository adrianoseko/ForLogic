import { Home } from './home';

describe('Home Component', () => {
  let home: Home;

  beforeEach(() => {
    home = new Home();
  });

  it('should create an instance', () => {
    expect(home).toBeTruthy();
  });
});
