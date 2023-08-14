import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteAppsComponent } from './favorite-apps.component';

describe('FavoriteAppsComponent', () => {
  let component: FavoriteAppsComponent;
  let fixture: ComponentFixture<FavoriteAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavoriteAppsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
