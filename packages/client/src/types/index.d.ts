export {};

declare global {
  let LOCAL_IP_HOST: string;
  interface Window {
    xtermFitAddon: { fit: () => void };
    io: unknown;
    clearCache: () => void;
    Toast: unknown;
    ot: unknown;
    MonacoEnvironment: any;
    loginWindow?: any;
  }

  namespace JSX {
    interface IntrinsicElements {
      'ninja-keys': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
