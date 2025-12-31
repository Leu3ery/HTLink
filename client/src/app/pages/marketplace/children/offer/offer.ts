import {Component, input, InputSignal} from '@angular/core';
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
  modalOpen = false;
  protected readonly Icons = Icons;


  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  protected readonly stop = stop;
}
