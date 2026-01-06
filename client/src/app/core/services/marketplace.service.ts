import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URL} from "@core/environment/config.constants";
import {OfferType, ProfileType, TagType} from "@core/types/types.constans";

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private currOffers: WritableSignal<OfferType[]> = signal([]);
  private http = inject(HttpClient);

  fetchOffers(filters: any){
    this.http.get<{ offers: OfferType[]; }>(API_URL + "/api/offers", {params: filters})
      .subscribe((data) => {
        this.currOffers.set(data.offers);
        return data.offers;
      })
  }

  get offers(){
    return this.currOffers;
  }
}
