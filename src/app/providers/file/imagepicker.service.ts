import { Injectable } from '@angular/core';
import { ImagePicker, ImagePickerOptions, OutputType } from '@ionic-native/image-picker/ngx';

@Injectable({
  providedIn: 'root'
})
export class ImagepickerService {

  readonly pickerOptions: ImagePickerOptions = {
    allow_video: false,
    outputType: OutputType.FILE_URL
  };

  constructor(private imagePicker: ImagePicker) { }

  pickImage(): Promise<any> {
    while (!this.imagePicker.hasReadPermission()) {
      this.imagePicker.requestReadPermission();
    }

    return this.imagePicker.getPictures(this.pickerOptions);
  }
}
