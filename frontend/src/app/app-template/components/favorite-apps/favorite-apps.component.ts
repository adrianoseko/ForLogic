import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteAppsService } from './favorite-apps.service';
import { App } from './app.model'; // Assuming an App model exists

@Component({
  selector: 'app-favorite-apps',
  templateUrl: './favorite-apps.component.html',
  styleUrls: ['./favorite-apps.component.scss'],
})
export class FavoriteAppsComponent implements OnInit {
  indexList: App[] = [];

  constructor(
    private router: Router,
    private favoriteAppsService: FavoriteAppsService
  ) {}

  ngOnInit(): void {
    this.loadFavoriteApps();
  }

  private loadFavoriteApps(): void {
    this.favoriteAppsService.getApps().subscribe({
      next: (apps: App[]) => this.indexList = apps,
      error: () => this.handleError('Houve algum erro ao carregar a lista.')
    });
  }

  public redirectTo(uri: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([uri]);
    });
  }

  public addHit(app: App): void {
    this.favoriteAppsService.addHit(app).subscribe({
      next: () => {
        this.loadFavoriteApps();
        this.handleAppRedirect(app);
      },
      error: () => this.handleError('Houve algum erro ao carregar a lista.')
    });
  }

  private handleAppRedirect(app: App): void {
    const url = app.url.includes('#') ? app.url.replace('#', '') : app.url;
    if (app.url.includes('#')) {
      this.redirectTo(url);
    } else {
      window.open(url);
    }
  }

  private handleError(message: string): void {
    alert(message);
  }
}