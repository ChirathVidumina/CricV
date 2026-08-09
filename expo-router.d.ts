declare module 'expo-router' {
  export const router: {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
  };
  export const useRouter: () => typeof router;
  export const Tabs: any;
}
