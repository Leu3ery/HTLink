import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileToDataUrl'
})
export class FileToDataUrlPipe implements PipeTransform {
  public static transform(
    value: File
  ): string {
    return URL.createObjectURL(value);
  }

  public transform(
    value: File
  ): string {
    return FileToDataUrlPipe.transform(value);
  }
}
