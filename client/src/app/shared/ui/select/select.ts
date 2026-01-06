import {Component, EventEmitter, HostListener, Input, Output, ElementRef, OnInit} from '@angular/core';
import {ClickOutsideDirective} from "@shared/utils/click-outside";
import {NgIcon} from "@ng-icons/core";
import {Icons} from "@core/types/icons.enum";


export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    NgIcon
  ],
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
})
export class AppSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select option';
  @Input() rounded = '2rem';
  @Input() isMultiple = false;
  @Input() value: any | null = this.isMultiple ? [] : null;

  @Output() valueChange = new EventEmitter<string | number | null>();
  @Output() change = new EventEmitter<{ target: { value: string | number | null } }>();

  isOpen = false;
  openUp = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.options.find((o) => (o.value ?? o) === this.value);
    if (this.isMultiple){
      if (Array.isArray(this.value) && this.value.length > 1) {
        return `${this.value.length} selected`;
      }
      else if (Array.isArray(this.value) && this.value.length === 1) {
        const singleSelected = this.options.find((o) => (o.value ?? o) === this.value[0]);
        return singleSelected ? (singleSelected.label ?? singleSelected) : this.placeholder;
      }
      else {
        return this.placeholder
      }
    }
    return selected ? (selected.label ?? selected) : this.placeholder;

  }

  toggle() {
    if (!this.options.length) return;

    if (!this.isOpen) {
      this.updateDropdownDirection();
    }

    this.isOpen = !this.isOpen;
  }

  selectOption(opt: SelectOption | null, event?: MouseEvent) {
    event?.stopPropagation();

    if (opt === null) {
      this.value = null;
      this.valueChange.emit(this.value);
      this.change.emit({ target: { value: this.value } });
      this.isOpen = false;
      return
    }

    if (this.isMultiple) {
      if (this.value?.includes(opt.value ?? opt)) {
        this.value = this.value.filter((v: any) => v !== (opt.value ?? opt));
      } else {
        this.value = this.value ? [...this.value, opt.value ?? opt] : [opt.value ?? opt];
      }
    } else {
      if (this.value === (opt.value ?? opt)) {
       this.value = null;
      } else {
        this.value = opt.value ?? opt;
      }
    }
    this.valueChange.emit(this.value);
    this.change.emit({ target: { value: this.value } });

    this.isOpen = false;
  }

  private updateDropdownDirection() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = Math.min(this.options.length * 48 + 16, 240); // примерная высота

    this.openUp = spaceBelow < dropdownHeight;
  }

  protected readonly Icons = Icons;
}
