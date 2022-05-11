export type ToastItemInput = {
  description: string;
  // 'info', 'success', 'warning', 'error'
  status?: string;
  duration?: number;
  action?: {
    label: string;
    fn: () => void;
  };
};

export type ToastItem = ToastItemInput & {
  id: number;
  duration?: number;
};
