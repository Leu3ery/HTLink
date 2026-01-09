import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URL} from "@core/environment/config.constants";
import {CreateOfferData, OfferType, UpdateOfferData} from "@core/types/types.constans";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private currOffers: WritableSignal<OfferType[]> = signal([]);
  private http = inject(HttpClient);

  /**
   * Get offers list with optional filters and pagination
   * @param filters - { title?: string, skills?: string[], offset?: number, limit?: number }
   */
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

  /**
   * Get current user's offers
   */
  async getMyOffers(): Promise<OfferType[]> {
    const response = await firstValueFrom(
      this.http.get<{ offers: OfferType[] }>(API_URL + "/api/offers/my")
    );
    return response.offers;
  }

  /**
   * Create a new offer
   * @param data - Offer data
   */
  async createOffer(data: CreateOfferData): Promise<{ offer: OfferType }> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('phoneNumber', data.phoneNumber);
    
    if (data.price !== undefined) {
      formData.append('price', data.price.toString());
    }
    
    data.skills.forEach((skill) => formData.append('skills', skill));
    
    if (data.photo_path) {
      formData.append('photo_path', data.photo_path);
    }

    return firstValueFrom(
      this.http.post<{ offer: OfferType }>(API_URL + "/api/offers", formData)
    );
  }

  /**
   * Update an existing offer
   * @param id - Offer ID
   * @param data - Updated offer data
   */
  async updateOffer(id: string, data: UpdateOfferData): Promise<{ offer: OfferType }> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.skills) {
      data.skills.forEach((skill) => formData.append('skills', skill));
    }
    if (data.photo_path) {
      formData.append('photo_path', data.photo_path);
    }

    return firstValueFrom(
      this.http.patch<{ offer: OfferType }>(API_URL + `/api/offers/${id}`, formData)
    );
  }

  /**
   * Delete an offer
   * @param id - Offer ID
   */
  async deleteOffer(id: string): Promise<{ offer: OfferType }> {
    return firstValueFrom(
      this.http.delete<{ offer: OfferType }>(API_URL + `/api/offers/${id}`)
    );
  }
}
