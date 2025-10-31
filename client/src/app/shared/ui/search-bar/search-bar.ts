import {Component, input, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Block} from '@shared/ui/block/block';
import {SvgIconComponent} from '@shared/utils/svg.component';

@Component({
  selector: 'app-search-bar',
  imports: [
    FormsModule,
    Block,
    SvgIconComponent
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  placeholder = input("Search...");
  value = model("")
}
