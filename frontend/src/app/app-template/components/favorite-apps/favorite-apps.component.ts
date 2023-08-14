import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteAppsService } from './favorite-apps.service';

@Component({
  selector: 'app-favorite-apps',
  templateUrl: './favorite-apps.component.html',
  styleUrls: ['./favorite-apps.component.scss'],
})
export class FavoriteAppsComponent implements OnInit {
  indexList: any[];

  constructor(
    private router: Router,
    private favoriteAppsService: FavoriteAppsService
  ) {}

  ngOnInit(): void {
    this.listIndex();
  }

  public listIndex() {
    this.favoriteAppsService.getApps().subscribe(
      (response) => {
        this.indexList = response;
      },
      (error) => {
        alert('Houve algum erro ao carregar a lista.');
      }
    );
  }

  public redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }

  addHit(index) {
    this.favoriteAppsService.addHit(index).subscribe(
      (response) => {
        this.listIndex();
        if (index.url.includes('#')) {
          this.redirectTo(index.url.replace('#', ''));
        } else {
          window.open(index.url);
        }
      },
      (error) => {
        alert('Houve algum erro ao carregar a lista.');
      }
    );
  }
}
