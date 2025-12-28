import {Component, effect, OnInit, signal} from '@angular/core';
import {Block} from '@shared/ui/block/block';
import {MarkdownComponent, MarkdownService} from 'ngx-markdown';
import {NgIcon} from '@ng-icons/core';
import {Editor, NgxEditorComponent, NgxEditorMenuComponent} from 'ngx-editor';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Icons} from '@core/types/icons.enum';
import {ReadmeService} from '@core/services/readme.service';
import TurndownService from 'turndown';
import {ProjectLayoutService} from '@app/pages/projects/project/children/project-layout/project-layout-service';

@Component({
  selector: 'app-read-me',
  imports: [
    Block,
    MarkdownComponent,
    NgIcon,
    NgxEditorComponent,
    NgxEditorMenuComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './read-me.html',
  styleUrl: './read-me.css',
})
export class ReadMe {
  constructor(
    private readmeService: ReadmeService,
    private markdown: MarkdownService,
    private projectLayoutService: ProjectLayoutService
  ) {
    effect(() => {
      this.fullReadme.set(this.turndown.turndown(this.editorHTML() || ''));
    });
    effect(() => {
      const data = this.projectLayoutService.data();
      if (data?.fullReadme) {
        this.fullReadme.set(data.fullReadme);
        const result = this.markdown.parse(data.fullReadme);
        if (result instanceof Promise) {
          result.then((html) => {
            this.editorHTML.set(html);
          });
        } else {
          this.editorHTML.set(result);
        }
      }
    })
  }

  protected readonly Icons = Icons;

  fullReadme = signal<string>('');
  editorHTML = signal<string>('');

  repoURl = signal<string>('');
  isLoading: any;
  loadError: any;
  fileError: any;

  turndown: TurndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  editor: Editor = new Editor();

  uploadFromRepo() {
    this.loadError = '';
    const url = this.repoURl().toString().trim();
    if (!url) return;

    this.isLoading = true;

    this.readmeService.getReadmeByRepoUrl(url).subscribe({
      next: (md) => {
        const result = this.markdown.parse(md);
        if (result instanceof Promise) {
          result.then((html) => {
            this.fullReadme.set(md);
            this.editorHTML.set(html);
          });
        } else {
          this.fullReadme.set(md);
          this.editorHTML.set(result);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.loadError = err?.message || 'Cannot load README 😢';
        this.isLoading = false;
      },
    });
  }

  onReadmeFileSelected(event: Event) {
    this.fileError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md')) {
      this.fileError = 'Please select a .md file';
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const md = reader.result as string;
      const result = this.markdown.parse(md);

      if (result instanceof Promise) {
        result.then((html) => {
          this.fullReadme.set(md);
          this.editorHTML.set(html);
        });
      } else {
        this.fullReadme.set(md);
        this.editorHTML.set(result);
      }
    };
    reader.onerror = () => {
      this.fileError = 'Error reading file';
    };
    reader.readAsText(file, 'utf-8');
  }
}
