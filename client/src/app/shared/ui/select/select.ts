import {Component, EventEmitter, HostListener, Input, Output, ElementRef, OnInit} from '@angular/core';


export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
})
export class AppSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select option';
  @Input() rounded = '2rem';
  @Input() value: string | number | null = null;

  @Output() valueChange = new EventEmitter<string | number | null>();
  @Output() change = new EventEmitter<{ target: { value: string | number | null } }>();

  isOpen = false;
  openUp = false; // <— добавляем флаг направления

  constructor(private el: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.options.find((o) => (o.value ?? o) === this.value);
    return selected ? (selected.label ?? selected) : this.placeholder;
  }

  toggle() {
    if (!this.options.length) return;

    if (!this.isOpen) {
      this.updateDropdownDirection();
    }

    this.isOpen = !this.isOpen;
  }

  selectOption(opt: SelectOption, event?: MouseEvent) {
    event?.stopPropagation();
    if (opt.disabled) return;

    this.value = opt.value ?? opt;
    this.valueChange.emit(this.value);
    this.change.emit({ target: { value: this.value } });

    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const inside = target.closest('app-select');
    if (!inside) this.isOpen = false;
  }

  private updateDropdownDirection() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = Math.min(this.options.length * 48 + 16, 240); // примерная высота

    this.openUp = spaceBelow < dropdownHeight;
  }
}
