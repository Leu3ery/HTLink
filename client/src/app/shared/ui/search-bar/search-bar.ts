import {Component, input, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Block} from '@shared/ui/block/block';
import {SvgIconComponent} from '@shared/utils/svg.component';

import {AppSelectComponent} from '@shared/ui/select/select';

@Component({
  selector: 'app-search-bar',
  imports: [
    FormsModule,
    Block,
    SvgIconComponent,
    AppSelectComponent
],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  placeholder = input("Search...");
  value = model("")

  filters = input<{label: string, options: any[]}[]>();

  submit = output<SearchOutput>();
  filtersValues: {[key: string]: any} = {};


  onSubmit() {
    this.submit.emit({
      value: this.value(),
      filters: this.filtersValues
    });
  }

  onChangeValueFilter(filterLabel: string, filterValue: any) {
    this.filtersValues[filterLabel.toLowerCase()] = filterValue;
  }
}


type SearchOutput = {
  value: string;
  filters: {[key: string]: any};
}
