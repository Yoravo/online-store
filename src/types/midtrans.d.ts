declare module "midtrans-client" {
  interface TransactionNotificationResult {
    order_id: string;
    transaction_status: string;
    fraud_status: string;
    payment_type: string;
    gross_amount: string;
  }

  interface TransactionClient {
    notification(body: unknown): Promise<TransactionNotificationResult>;
  }

  class Snap {
    transaction: TransactionClient;
    createTransaction(
      params: unknown,
    ): Promise<{ token: string; redirect_url: string }>;
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    });
  }

  class CoreApi {
    transaction: TransactionClient;
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    });
  }
}

interface SnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, callbacks: SnapCallbacks) => void;
}

declare global {
  interface Window {
    snap: Snap;
  }
}

export {};