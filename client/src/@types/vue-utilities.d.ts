import Vue2 from 'vue';

interface PromptParams {
  title: string;
  text: string | string[];
  positiveButton?: string;
  negativeButton?: string;
  confirm?: boolean;
}

interface SnackBarParams{
  text: string;
  title?: string;
  button: string;
  callback?: () => void;
  timeout?: number;
  immediate?: boolean;
}
interface SnackBarMethods {
  setOptions: ({
    bottom, top, right, left, app,
  }: {bottom?: boolean; top?: boolean; right?: boolean; left?: boolean; app?: boolean }) => void;
  hide: () => void;
}

declare module 'vue/types/vue' {
  interface Vue {
    $promptAttach(): Vue2;
    $prompt: {
      (arg: PromptParams): Promise<boolean>;
      visible: () => boolean;
      hide: () => void;
    };
    $snackbarAttach(): Vue2;
    $snackbar: ((arg: SnackBarParams) => Promise<unknown>) & SnackBarMethods;
  }
}
