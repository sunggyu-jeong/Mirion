if (typeof window === 'undefined') {
  (global as any).window = global;
}

if (!window.addEventListener) {
  (window as any).addEventListener = () => {};
  (window as any).removeEventListener = () => {};
  (window as any).dispatchEvent = () => true;
}

if (!(global as any).CustomEvent) {
  (global as any).CustomEvent = class CustomEvent {
    constructor(event: string, params: any) {
      return { type: event, detail: params?.detail };
    }
  };
}
