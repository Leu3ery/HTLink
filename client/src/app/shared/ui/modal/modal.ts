
import { Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal{

  @HostBinding('style') @Input() style: any;
  @Input() showBackdrop: boolean = true;
}
