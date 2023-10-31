export type ToastItemInput = {
  description: string;
  // 'normal',  'info', 'success', 'warning', 'error'
  status?: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    fn: () => void;
  };
};

export type ToastItem = ToastItemInput & {
  id: string;
  duration?: number;
};
