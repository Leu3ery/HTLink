import {Component, inject, OnInit, signal} from '@angular/core';
import {MarketplaceService} from '@core/services/marketplace.service';
import {OfferType} from '@core/types/types.constans';
import {Offer} from '@app/pages/marketplace/children/offer/offer';
import {NgIcon} from '@ng-icons/core';
import {Icons} from '@core/types/icons.enum';
import {Modal} from '@shared/ui/modal/modal';
import {CreateOffer} from '@app/pages/marketplace/create-offer/create-offer';

@Component({
  selector: 'app-my-offers',
  imports: [
    Offer,
    NgIcon,
    Modal,
    CreateOffer
  ],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.css'
})
export class MyOffers implements OnInit {
  marketplaceService = inject(MarketplaceService);
  myOffers: OfferType[] = [];
  isLoading = true;
  isCreateModalOpen = signal(false);
  editingOffer: OfferType | undefined = undefined;
  Icons = Icons;

  async ngOnInit() {
    await this.loadOffers();
  }

  async loadOffers() {
    this.isLoading = true;
    try {
      this.myOffers = await this.marketplaceService.getMyOffers();
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteOffer(id: string) {
    try {
      await this.marketplaceService.deleteOffer(id);
      this.myOffers = this.myOffers.filter(offer => offer.id !== id);
      this.isCreateModalOpen.set(false);
      this.editingOffer = undefined;
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer');
    }
  }

  eventPreventDefault(event: PointerEvent) {
    event.stopPropagation();
  }

  onOfferCreated() {
    this.isCreateModalOpen.set(false);
    this.editingOffer = undefined;
    this.loadOffers();
  }

  openEditModal(offer: OfferType) {
    this.editingOffer = offer;
    this.isCreateModalOpen.set(true);
  }

  openCreateModal() {
    this.editingOffer = undefined;
    this.isCreateModalOpen.set(true);
  }
}

