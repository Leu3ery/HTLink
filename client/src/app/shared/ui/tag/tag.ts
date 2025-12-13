import {Component, EventEmitter, HostBinding, input, Input, OnInit, Output} from '@angular/core';
import { Icons } from '@core/types/icons.enum';
import { NgIcon } from "@ng-icons/core";

export type TagType = 'class' | 'department' | 'role';

@Component({
  selector: 'app-tag',
  imports: [NgIcon],
  templateUrl: './tag.html',
  standalone: true,
  styleUrl: './tag.css'
})
export class Tag implements OnInit {
  Icons = Icons;
  
  @Input() removable: boolean = false;
  @Output() remove = new EventEmitter<unknown>();

  @HostBinding('class.dep') dep = false;
  @HostBinding('class.role') role = false;


  type = input<TagType>();

  ngOnInit() {
    switch (this.type()) {
      case 'class':
        break;
      case 'department':
        this.dep = true;
        break;
      case 'role':
        this.role = true;
        break;
    }
  }

}
