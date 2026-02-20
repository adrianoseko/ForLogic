import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvaliacaoComponent } from './avaliacao.component';

describe('AvaliacaoComponent', () => {
  let component: AvaliacaoComponent;
  let fixture: ComponentFixture<AvaliacaoComponent>;

  beforeEach(async () => {
    await setupTestingModule();
  });

  beforeEach(() => {
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  async function setupTestingModule(): Promise<void> {
    await TestBed.configureTestingModule({
      declarations: [AvaliacaoComponent],
    }).compileComponents();
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(AvaliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }
});