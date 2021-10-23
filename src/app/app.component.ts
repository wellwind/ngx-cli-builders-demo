import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  files$ = this.httpClient
    .get<{articles: string[]}>('./assets/posts.json')
    .pipe(
      map(result => result.articles)
    );

  constructor(private httpClient: HttpClient) {
  }

}
