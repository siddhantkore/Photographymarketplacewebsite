import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useCart } from '../contexts/cart-context';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ordersApi } from '../services/api';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

type RazorpayVerifyResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayVerifyResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on?: (eventName: string, callback: (response: any) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;
const RAZORPAY_CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const ensureRazorpayScript = async () => {
  if (window.Razorpay) {
    return;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout SDK'));
      document.body.appendChild(script);
    });
  }

  await razorpayScriptPromise;
};

export function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsProcessing(true);
      await ensureRazorpayScript();

      const response: any = await ordersApi.create({ paymentMethod: 'RAZORPAY' });
      const order = response?.data?.order;
      const payment = response?.data?.payment;

      if (!order?.id || !payment?.orderId || !payment?.key) {
        throw new Error('Invalid payment session from server');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout SDK is unavailable');
      }

      const checkout = new window.Razorpay({
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        name: 'Photography Marketplace',
        description: 'Secure digital product purchase',
        order_id: payment.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#2563eb' },
        handler: async (verificationResponse) => {
          try {
            await ordersApi.verifyPayment(order.id, {
              razorpayOrderId: verificationResponse.razorpay_order_id,
              razorpayPaymentId: verificationResponse.razorpay_payment_id,
              razorpaySignature: verificationResponse.razorpay_signature,
            });

            await clearCart();
            toast.success('Payment verified and access granted');
            navigate('/orders');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(
              'Payment received but verification failed. Access will sync once webhook is processed.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      });

      checkout.on?.('payment.failed', () => {
        setIsProcessing(false);
        toast.error('Payment failed. You can retry checkout safely.');
      });

      checkout.open();
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(error?.message || 'Unable to start payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user?.name} disabled />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment</h2>
                <p className="text-sm text-gray-600">
                  Checkout opens in Razorpay and payment is verified on backend before granting
                  download access.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.resolution}`}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-gray-500">{item.resolution}</p>
                      </div>
                      <span className="font-medium text-gray-900">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">₹{getTotal()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${getTotal()}`}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
