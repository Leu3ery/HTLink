import {Component, input} from '@angular/core';
import {ImageType} from '@core/types/types.constans';

@Component({
  selector: 'app-image-gallery',
  imports: [],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css'
})
export class ImageGallery {

  images = input.required<ImageType[]>();
}
