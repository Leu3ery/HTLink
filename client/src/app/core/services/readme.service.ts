import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReadmeService {
  rawHttp: HttpClient;

  constructor(
    http: HttpClient,
    backend: HttpBackend
  ) {
    this.rawHttp = new HttpClient(backend);
  }

  getReadmeByRepoUrl(repoUrl: string): Observable<string> {
    const { owner, repo } = this.parseGithubOrGitlab(repoUrl);

    if (owner.host === 'github.com') {
      return this.getGithubRawReadme(owner.name, repo);
    }

    return throwError(() => new Error('Only GitHub / GitLab are supported for now'));
  }


  private getGithubRawReadme(owner: string, repo: string): Observable<string> {
    const mainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/README.md`;
    const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/master/README.md`;

    https: return this.rawHttp.get(mainUrl, { responseType: 'text' }).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return this.rawHttp.get(masterUrl, { responseType: 'text' });
        }
        return throwError(() => err);
      })
    );
  }

  private parseGithubOrGitlab(repoUrl: string): {
    owner: { host: string; name: string };
    repo: string;
  } {
    const url = new URL(repoUrl.trim());
    const host = url.hostname.replace(/^www\./, '');
    const path = url.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
    const parts = path.split('/');

    if (host === 'github.com') {
      if (parts.length < 2) throw new Error('Invalid GitHub URL');
      return { owner: { host, name: parts[0] }, repo: parts[1] };
    } if (host === 'gitlab.com') {
      if (parts.length < 2) throw new Error('Invalid GitHub URL');
      return { owner: { host, name: parts[0] }, repo: parts[1] };
    }

    throw new Error('Unsupported host');
  }
}
