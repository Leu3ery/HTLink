import {Component, input} from '@angular/core';
import {ImageType} from '@core/types/types.constans';
import { ImgPipe } from "../../utils/img.pipe";

@Component({
    selector: 'app-image-gallery',
    imports: [ImgPipe],
    templateUrl: './image-gallery.html',
    standalone: true,
    styleUrl: './image-gallery.css'
})
export class ImageGallery {

  images = input.required<ImageType[]>();
}
