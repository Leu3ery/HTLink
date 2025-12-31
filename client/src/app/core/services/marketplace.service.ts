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
    this.currOffers.set([
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          },
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          },
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
      {
        id: "1",
        user: {
          id: "2",
          first_name: "John",
          last_name: "Doel",
          photo_path: "path",
          mail: "johndoe@test.com"
        },
        rating: 4.6,
        category: {
          id: "1623761273",
          name: "Development"
        },
        title: "abra cadabra",
        description: "lorem ipsum dolor sit amet",
        price: 100,
        createdAt: '2024-01-01T00:00:00Z',
        tags: [
          {
            id: '1982397812',
            name: 'Шкюха'
          },
          {
            id: '19823812',
            name: 'Шкюха'
          },
          {
            id: '19897812',
            name: 'Шкюха'
          }
        ]
      },
    ])
    return
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
