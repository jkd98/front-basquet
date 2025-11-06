import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomToastService {
  #showToast = signal<boolean>(false);
  #typeMessage = signal<string>('info');
  #message = signal<string>('mensaje');

  showToast = computed(() => this.#showToast());
  typeMessage = computed(() => this.#typeMessage());
  message = computed(() => this.#message());

  #timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() { }

  renderToast(message: string, typeMessage: string) {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
    this.#typeMessage.set(typeMessage);
    this.#message.set(message);
    this.#showToast.set(true);
    console.log({ message, typeMessage, showToast:this.#showToast() });
    this.#timeoutId = setTimeout(() => {
      this.#showToast.set(false);
    }, 4000);
  }
}
