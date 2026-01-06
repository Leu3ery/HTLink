import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside], [appClickBackspace]',
  standalone: true, // убери, если не используешь standalone
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<any>();
  @Output() appClickBackspace = new EventEmitter<any>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    const clickedInside = !!target && this.el.nativeElement.contains(target);

    if (!clickedInside) {
      this.appClickOutside.emit(event);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: any) {
    this.appClickOutside.emit(event);
  }

  @HostListener('document:keydown.backspace', ['$event'])
  onBackspace(event: any) {
    this.appClickBackspace.emit(event);
  }
}