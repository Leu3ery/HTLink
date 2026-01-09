import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MarketplaceService} from '@core/services/marketplace.service';
import {MainService} from '@core/services/main.service';
import {CreateOfferData, OfferType, TagType, UpdateOfferData} from '@core/types/types.constans';
import {Block} from '@shared/ui/block/block';
import {AppSelectComponent} from '@shared/ui/select/select';
import {Tag} from '@shared/ui/tag/tag';
import {NgIcon} from '@ng-icons/core';
import {Icons} from '@core/types/icons.enum';
import {ImgPipe} from '@shared/utils/img.pipe';
import {Modal} from '@shared/ui/modal/modal';

@Component({
  selector: 'app-create-offer',
  imports: [
    ReactiveFormsModule,
    Block,
    AppSelectComponent,
    Tag,
    NgIcon,
    ImgPipe,
    Modal
  ],
  templateUrl: './create-offer.html',
  styleUrl: './create-offer.css'
})
export class CreateOffer implements OnInit {
  @Input() editOffer?: OfferType;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  
  marketplaceService = inject(MarketplaceService);
  mainService = inject(MainService);
  Icons = Icons;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  skills: TagType[] = [];
  isLoading = false;
  isEditMode = false;
  showDeleteConfirm = false;

  offerForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(1000)
    ]),
    phoneNumber: new FormControl('', [
      Validators.pattern(/^\+?[1-9]\d{7,14}$/)
    ]),
    price: new FormControl<number | null>(null),
    skills: new FormControl<TagType[]>([], Validators.required)
  });

  async ngOnInit() {
    this.skills = (await this.mainService.getSkills()) ?? [];
    
    if (this.editOffer) {
      this.isEditMode = true;
      this.previewUrl = this.editOffer.photo_path || null;
      
      this.offerForm.patchValue({
        title: this.editOffer.title,
        description: this.editOffer.description,
        phoneNumber: this.editOffer.phoneNumber,
        price: this.editOffer.price || null,
        skills: this.editOffer.skills
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  addSkill(event: { target: { value: string | number | null } }) {
    const value = event.target.value;
    const skill = this.skills.find((s) => s.id === value);
    
    if (skill) {
      const currentSkills: TagType[] = this.offerForm.get('skills')?.value || [];
      if (!currentSkills.find((s) => s.id === skill.id)) {
        this.offerForm.patchValue({ skills: [...currentSkills, skill] });
      }
    }
  }

  removeSkill(skill: TagType) {
    const newSkills: TagType[] = this.offerForm.get('skills')?.value || [];
    this.offerForm.patchValue({ 
      skills: newSkills.filter((s: TagType) => s.id !== skill.id) 
    });
  }

  toOptions(items: TagType[]) {
    return items.map((i) => ({ label: i.name, value: i.id }));
  }

  async createOffer() {
    if (this.offerForm.invalid) {
      Object.keys(this.offerForm.controls).forEach(key => {
        const control = this.offerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    const formValue = this.offerForm.value;

    try {
      if (this.isEditMode && this.editOffer) {
        const data: UpdateOfferData = {
          title: formValue.title!,
          description: formValue.description!,
          phoneNumber: formValue.phoneNumber!,
          price: formValue.price ?? undefined,
          skills: (formValue.skills || []).map((s) => s.id),
          photo_path: this.selectedFile ?? undefined
        };
        await this.marketplaceService.updateOffer(this.editOffer.id, data);
      } else {
        const data: CreateOfferData = {
          title: formValue.title!,
          description: formValue.description!,
          phoneNumber: formValue.phoneNumber!,
          price: formValue.price ?? undefined,
          skills: (formValue.skills || []).map((s) => s.id),
          photo_path: this.selectedFile ?? undefined
        };
        await this.marketplaceService.createOffer(data);
      }
      this.close.emit();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error saving offer. Please check your data and try again.');
      this.isLoading = false;
    }
  }

  showDeleteConfirmation() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.editOffer) {
      this.delete.emit(this.editOffer.id);
      this.showDeleteConfirm = false;
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}

