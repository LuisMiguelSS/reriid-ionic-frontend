import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANGUAGE_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  selected = '';

  constructor(
    private translate: TranslateService,
    private storage: Storage
  ) { }

    setInitialAppLanguage() {
      const language = this.translate.getBrowserLang();
      this.translate.setDefaultLang(language);

      this.storage.get(LANGUAGE_KEY).then(val => {
        if (val) {
          this.setLanguage(val);
          this.selected = val;
        }
      });
    }

    getAvailableLanguages() {
      return [
        { text: 'English', value: 'en' },
        { text: 'Spanish', value: 'es' }
      ];
    }

    setLanguage(language) {
      this.translate.use(language);
      this.selected = language;
      this.storage.set(LANGUAGE_KEY, language);
    }

}
