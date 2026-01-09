import {Component, EventEmitter, input, InputSignal, Output} from '@angular/core';
import {Block} from "@shared/ui/block/block";
import {ImgPipe} from "@shared/utils/img.pipe";
import {OfferType} from "@core/types/types.constans";
import {NgIcon} from "@ng-icons/core";
import {Icons} from "@core/types/icons.enum";
import {Tag} from "@shared/ui/tag/tag";
import {Modal} from "@shared/ui/modal/modal";
import {CurrencyPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-offer',
  imports: [
    Block,
    ImgPipe,
    NgIcon,
    Tag,
    Modal,
    NgIf,
    CurrencyPipe
  ],
  templateUrl: './offer.html',
  styleUrl: './offer.css',
})
export class Offer {
  data: InputSignal<OfferType> = input.required();
  showEditButton = input<boolean>(false);
  @Output() edit = new EventEmitter<OfferType>();
  
  modalOpen = false;
  protected readonly Icons = Icons;

  constructor() {
    // Log data when component initializes
    setTimeout(() => {
      console.log('Offer Data:', this.data());
      console.log('Owner Info:', this.data().ownerId);
      console.log('First Name:', this.data().ownerId.first_name);
      console.log('Last Name:', this.data().ownerId.last_name);
    }, 0);
  }

  getCleanName() {
    const firstName = this.data().ownerId.first_name || '';
    // let lastName = this.data().ownerId.last_name || '';
    
    // Remove email part if present in last name
    // if (lastName.includes('@')) {
    //   lastName = lastName.split('@')[0];
    // }
    
    // return `${firstName} ${lastName}`.trim();
    return firstName;
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.data());
  }

  protected readonly stop = stop;
}

