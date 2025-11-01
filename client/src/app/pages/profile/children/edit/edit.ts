import {Component, effect, inject, OnInit} from '@angular/core';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {Block} from '@shared/ui/block/block';
import {RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TagType} from '@core/types/types.constans';
import {ProfileService} from '@core/services/profile.service';
import {ImgPipe} from '@shared/utils/img.pipe';
import {Tag} from '@shared/ui/tag/tag';
import {MainService} from '@core/services/main.service';

@Component({
  selector: 'app-edit',
  imports: [
    SvgIconComponent,
    Block,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    Tag
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class Edit implements OnInit {
  constructor(public profileService: ProfileService) {
    effect(() => {
      const me = this.profileService.me$();
      if (!me) return;

      this.profileForm.patchValue({
        ...me,
        photo_path: me.photo_path ? ImgPipe.transform(me.photo_path) : null,
      });
    });
  }

  private mainService = inject(MainService);


  profileForm = new FormGroup({
    photo_path: new FormControl<string | null>(null),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.maxLength(160)]),
    github_link: new FormControl('', [Validators.pattern('https://github.com/.+')]),
    linkedin_link: new FormControl('', [Validators.pattern('https://linkedin.com/.+')]),
    skills: new FormControl<TagType[]>([]),
  })
  skills: TagType[] = [];


  async ngOnInit(): Promise<void> {
    this.skills = await this.mainService.getSkills() ?? [];
  }
  onFileSelected(event: any){
    const file:File = event.target.files[0];

    if (file) {
      this.profileForm.patchValue({photo_path: URL.createObjectURL(file)});
    }
  }
  submitEdit(){
    if (this.profileForm.valid) {
      this.profileService.updateProfile(this.profileForm.value)
    }
  }

  removeSkill(skill: TagType) {
    let newSkills: TagType[] = this.profileForm.get('skills')?.value || [];
    this.profileForm.patchValue({skills: newSkills.filter((s: TagType) => s.id !== skill.id)});
  }

  addSkill($event: Event) {
    const input = $event.target as HTMLInputElement;
    const value = input.value;

    const skill = this.skills.find(s => s.id === value);
    if (skill) {
      const currentSkills: TagType[] = this.profileForm.get('skills')?.value || [];
      if (!currentSkills.find(s => s.id === skill.id)) {
        this.profileForm.patchValue({skills: [...currentSkills, skill]});
      }
    }
    input.value = '';
  }
}
