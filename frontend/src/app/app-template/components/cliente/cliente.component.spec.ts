import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteComponent } from './cliente.component';

describe('ClienteComponent', () => {
  let component: ClienteComponent;
  let fixture: ComponentFixture<ClienteComponent>;

  // Helper to create and initialize the component instance
  const createComponent = (): void => {
    fixture = TestBed.createComponent(ClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      declarations: [ClienteComponent],
    }).compileComponents();
  });

  beforeEach((): void => {
    createComponent();
  });

  afterEach((): void => {
    // Clean up fixture and testing module to avoid side effects between tests
    if (fixture) {
      fixture.destroy();
    }
    TestBed.resetTestingModule();
  });

  it('should create the component', (): void => {
    expect(component).toBeTruthy();
  });
});
