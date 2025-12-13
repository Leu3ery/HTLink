import { Component, inject, OnInit } from '@angular/core';
import { FileToDataUrlPipe } from "@shared/utils/fileToDataUrl.pipe";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Block } from "@shared/ui/block/block";
import { AppSelectComponent } from "@shared/ui/select/select";
import { ProjectCreateData, TagType } from '@core/types/types.constans';
import { Tag } from '@shared/ui/tag/tag';
import { MainService } from '@core/services/main.service';

import { Editor, NgxEditorMenuComponent, NgxEditorComponent, NgxEditorFloatingMenuComponent } from 'ngx-editor';
import { MarkdownComponent, MarkdownService } from "ngx-markdown";
import { ReadmeService } from '@core/services/readme.service';
import TurndownService from 'turndown';
import { ProjectsService } from '@core/services/projects.service';
import { NgIcon } from "@ng-icons/core";
import { Icons } from '@core/types/icons.enum';

@Component({
  selector: 'app-create-project',
  imports: [
    FileToDataUrlPipe,
    Block,
    ReactiveFormsModule,
    AppSelectComponent,
    Tag,
    NgxEditorMenuComponent,
    NgxEditorComponent,
    MarkdownComponent,
    FormsModule,
    NgIcon
],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject implements OnInit {
  step = 1;

  selectedFiles: File[] = [];
  createForm = new FormGroup({
    id: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(12),
    ]),
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
    category: new FormControl('', Validators.required),
    shortDescription: new FormControl('', [Validators.maxLength(500), Validators.required]),
    fullReadme: new FormControl<string>('', [Validators.maxLength(10000)]),
    deadline: new FormControl<string>(null as any),
    skills: new FormControl<TagType[]>([], Validators.required),
    repoUrl: new FormControl('', []),
    editorHTML: new FormControl<string>('', []),
  });

  skills: TagType[] = [];
  categories: any = [];
  mainService = inject(MainService);
  turndown: TurndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  editor: Editor = new Editor();
  html: any;

  isLoading = false;
  fileError = '';
  loadError = '';
  Icons = Icons;

  constructor(
    private fb: FormBuilder,
    private readmeService: ReadmeService,
    private markdown: MarkdownService,
    private projectsService: ProjectsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.skills = (await this.mainService.getSkills()) ?? [];
    this.categories = (await this.mainService.getCategories()) ?? [];

    this.createForm.get('editorHTML')?.valueChanges.subscribe((html: string | null) => {
      this.createForm.patchValue({ fullReadme: this.turndown.turndown(html || '') });
    });
    this.createForm.get('id')?.valueChanges.subscribe((id: string | null) => {
      this.projectsService.checkProjectIdAvailability(id || '').then((isAvailable: any) => {
        if (!isAvailable) {
          this.createForm.get('id')?.setErrors({ notAvailable: true });
        } else {
          const errors = this.createForm.get('id')?.errors;
          if (errors) {
            delete errors['notAvailable'];
            if (Object.keys(errors).length === 0) {
              this.createForm.get('id')?.setErrors(null);
            } else {
              this.createForm.get('id')?.setErrors(errors);
            }
          }
        }
      });
    });
  }
  onSelectFiles(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedFiles = [...this.selectedFiles, ...Array.from(files)].slice(0, 10);
    }
    this.step = 1.1;
  }
  changeCategory($event: { target: { value: string | number | null } }) {
    const value = $event.target.value;

    if (!value) return;
    this.createForm.patchValue({ category: String(value) });
  }
  removeSkill(skill: TagType) {
    let newSkills: TagType[] = this.createForm.get('skills')?.value || [];
    this.createForm.patchValue({ skills: newSkills.filter((s: TagType) => s.id !== skill.id) });
  }
  addSkill($event: {
    target: {
      value: string | number | null;
    };
  }) {
    const value = $event.target.value;

    const skill = this.skills.find((s) => s.id === value);
    if (skill) {
      const currentSkills: TagType[] = this.createForm.get('skills')?.value || [];
      if (!currentSkills.find((s) => s.id === skill.id)) {
        this.createForm.patchValue({ skills: [...currentSkills, skill] });
      }
    }
  }
  toOptions(skills: TagType[]) {
    return skills.map((i) => ({ label: i.name, value: i.id }));
  }
  getProjectIdErrorMessage() {
    const control = this.createForm.get('id');
    if (control?.hasError('minlength')) {
      return 'Project Id must be at least 3 characters long';
    }
    if (control?.hasError('maxlength')) {
      return 'Project Id cannot be more than 12 characters long';
    }
    if (control?.hasError('maxlength')) {
      return 'Project Id cannot be more than 12 characters long';
    }
    if (control?.hasError('notAvailable')) {
      return 'Project Id is not available';
    }
    return '';
  }
  async createProject() {
    if (this.createForm.invalid) {
      return;
    }
    const formValue = this.createForm.value;
    const data: ProjectCreateData = {
      title: formValue.title!,
      shortDescription: formValue.shortDescription!,
      repoUrl: formValue.repoUrl!,
      categoryId: formValue.category!,
      skills: (formValue.skills || []).map((s) => s.id),
      fullReadme: formValue.fullReadme!,
      images: this.selectedFiles,
      deadline: formValue.deadline ? formValue.deadline : undefined,
    };
    try {
      const result = await this.projectsService.createProject(data);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }
  ngOnDestroy() {
    this.editor.destroy();
  }
  uploadFromRepo() {
    this.loadError = '';
    const url = this.createForm.get('repoUrl')?.value?.toString().trim();
    if (!url) return;

    this.isLoading = true;

    this.readmeService.getReadmeByRepoUrl(url).subscribe({
      next: (md) => {
        const result = this.markdown.parse(md);
        if (result instanceof Promise) {
          result.then((html) => {
            this.createForm.patchValue({
              fullReadme: md,
              editorHTML: html,
            });
          });
        } else {
          this.createForm.patchValue({
            fullReadme: md,
            editorHTML: result,
          });
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
          this.createForm.patchValue({ fullReadme: md, editorHTML: html });
        });
      } else {
        this.createForm.patchValue({ fullReadme: md, editorHTML: result });
      }
    };
    reader.onerror = () => {
      this.fileError = 'Error reading file';
    };
    reader.readAsText(file, 'utf-8');
  }
}
