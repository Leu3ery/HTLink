import {Component, computed, inject, OnInit} from '@angular/core';
import {SearchBar} from "@shared/ui/search-bar/search-bar";
import {MarketplaceService} from "@core/services/marketplace.service";
import {Offer} from "@app/pages/marketplace/children/offer/offer";
import {MainService} from "@core/services/main.service";
import {TagType} from "@core/types/types.constans";

@Component({
  selector: 'app-marketplace',
  imports: [
    SearchBar,
    Offer
  ],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css'
})
export class Marketplace implements OnInit {
  marketplaceService = inject(MarketplaceService);
  mainService = inject(MainService);
  offers = computed(this.marketplaceService.offers);

  filters: any = [
    {
      label: 'Skills',
      options: [],
      multiple: true
    }
  ];


  ngOnInit() {
    this.marketplaceService.fetchOffers({})
    this.mainService.getSkills().then((res: TagType[]) => {
      const skillsOptions = res.map(skill => ({
        label: skill.name,
        value: skill.id
      }));

      const skillsFilter = this.filters.find((f: { label: string; }) => f.label === 'Skills');
      if (skillsFilter) {
        skillsFilter.options = skillsOptions;
      }
    });
  }
  onSearchSubmit(event: {value: string, filters: {[key: string]: any}}) {
    this.filters = event.filters;
    this.filters['title'] = event.value ?? undefined;
    this.marketplaceService.fetchOffers(this.filters);
  }
}
