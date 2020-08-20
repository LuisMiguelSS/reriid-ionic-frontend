import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANGUAGE_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLanguageCode: string = '';

  constructor(
    private translatorService: TranslateService,
    private storage: Storage
  ) { }

    setInitialAppLanguage(): void {
      this.translatorService.setDefaultLang(
        this.translatorService.getBrowserLang()
      );

      this.storage.get(LANGUAGE_KEY).then( (language: string) => {
        if (language)
          this.setLanguage(language);
      });
    }

    getAvailableLanguages() {
      return [
        { text: 'English', value: 'en' },
        { text: 'Spanish', value: 'es' }
      ];
    }

    setLanguage(languageCode: string): void {
      this.translatorService.use(languageCode);
      this.currentLanguageCode = languageCode;
      this.storage.set(LANGUAGE_KEY, languageCode);
    }

    getCurrentLanguage(): string {
      return this.currentLanguageCode;
    }

}
