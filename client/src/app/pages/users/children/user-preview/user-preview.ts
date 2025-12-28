import {Component, input} from '@angular/core';
import {ProfileType} from '@core/types/types.constans';
import {Block} from '@shared/ui/block/block';
import {Tag} from '@shared/ui/tag/tag';
import {RouterLink} from '@angular/router';
import {ImgPipe} from '@shared/utils/img.pipe';

@Component({
  selector: 'app-user-preview',
  imports: [
    Block,
    Tag,
    RouterLink,
    ImgPipe
  ],
  templateUrl: './user-preview.html',
  standalone: true,
  styleUrl: './user-preview.css'
})
export class UserPreview {
    data = input.required<ProfileType>()

    constructor() {
      this.data.bind((item: any)=>{
          this.data = item
      })
    }
}
