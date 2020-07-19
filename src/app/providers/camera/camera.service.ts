import { Injectable } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor(private camera: Camera) { }

  takePicture(source: PictureSourceType) {

    const cameraOptions: CameraOptions = {
      quality: 100,
      sourceType: source,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      allowEdit: true
    };

    return this.camera.getPicture(cameraOptions);
  }
}
