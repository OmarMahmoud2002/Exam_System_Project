import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Log to debug bootstrap process
console.log('Starting application bootstrap');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => console.log('Application bootstrapped successfully'))
  .catch(err => console.error('Bootstrap error:', err));
