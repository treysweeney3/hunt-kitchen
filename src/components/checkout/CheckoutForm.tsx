"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ShippingForm } from "./ShippingForm";
import { PaymentForm } from "./PaymentForm";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Truck, CreditCard, User, Package } from "lucide-react";

const checkoutFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    streetAddress1: z.string().min(1, "Street address is required"),
    streetAddress2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
  sameAsShipping: z.boolean().default(true),
  billingAddress: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    streetAddress1: z.string().optional(),
    streetAddress2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  shippingMethod: z.string().min(1, "Please select a shipping method"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const SHIPPING_RATES: ShippingRate[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 5.99,
    estimatedDays: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    price: 12.99,
    estimatedDays: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    price: 24.99,
    estimatedDays: "1 business day",
  },
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, isEmpty } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema) as any,
    defaultValues: {
      email: "",
      phone: "",
      shippingAddress: {
        firstName: "",
        lastName: "",
        streetAddress1: "",
        streetAddress2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      sameAsShipping: true,
      shippingMethod: "",
    },
  });

  const sameAsShipping = form.watch("sameAsShipping");
  const shippingMethod = form.watch("shippingMethod");

  // Update selected shipping rate when method changes
  useEffect(() => {
    if (shippingMethod) {
      const rate = SHIPPING_RATES.find((r) => r.id === shippingMethod);
      setSelectedShippingRate(rate || null);
    }
  }, [shippingMethod]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isEmpty) {
      router.push("/cart");
    }
  }, [isEmpty, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          shippingAddress: data.shippingAddress,
          billingAddress: data.sameAsShipping ? data.shippingAddress : data.billingAddress,
          sameAsShipping: data.sameAsShipping,
          shippingRate: selectedShippingRate,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to create checkout session");
        setIsSubmitting(false);
        return;
      }

      // Redirect to Stripe checkout
      if (result.data.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["shippingAddress"];
        if (!sameAsShipping) {
          fieldsToValidate.push("billingAddress");
        }
        break;
      case 3:
        fieldsToValidate = ["shippingMethod"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (isEmpty) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Contact Information */}
        <Card className={currentStep === 1 ? "border-forestGreen" : "bg-white"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep > 1 ? "bg-forestGreen text-white" : "bg-forestGreen/10 text-forestGreen"
                  }`}
                >
                  {currentStep > 1 ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="text-barkBrown">Contact Information</CardTitle>
              </div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="text-forestGreen"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          {currentStep === 1 && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-slate">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-forestGreen hover:bg-forestGreen/90"
              >
                Continue to Shipping
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Shipping Address */}
        <Card className={currentStep === 2 ? "border-forestGreen" : "bg-white"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep > 2 ? "bg-forestGreen text-white" : "bg-forestGreen/10 text-forestGreen"
                  }`}
                >
                  {currentStep > 2 ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="text-barkBrown">Shipping Address</CardTitle>
              </div>
              {currentStep > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="text-forestGreen"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          {currentStep === 2 && (
            <CardContent className="space-y-6">
              <ShippingForm form={form} prefix="shippingAddress" />

              <Separator />

              <FormField
                control={form.control}
                name="sameAsShipping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Billing address same as shipping</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!sameAsShipping && (
                <>
                  <Separator />
                  <h3 className="font-semibold text-barkBrown">Billing Address</h3>
                  <ShippingForm form={form} prefix="billingAddress" />
                </>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-forestGreen hover:bg-forestGreen/90"
                >
                  Continue to Shipping Method
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 3: Shipping Method */}
        <Card className={currentStep === 3 ? "border-forestGreen" : "bg-white"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep > 3 ? "bg-forestGreen text-white" : "bg-forestGreen/10 text-forestGreen"
                  }`}
                >
                  {currentStep > 3 ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="text-barkBrown">Shipping Method</CardTitle>
              </div>
              {currentStep > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  className="text-forestGreen"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          {currentStep === 3 && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="shippingMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value}>
                        {SHIPPING_RATES.map((rate) => (
                          <label
                            key={rate.id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                              field.value === rate.id
                                ? "border-forestGreen bg-forestGreen/5"
                                : "border-stone hover:border-forestGreen/30"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={rate.id} id={rate.id} />
                              <div>
                                <p className="font-semibold text-barkBrown">{rate.name}</p>
                                <p className="text-sm text-slate">{rate.estimatedDays}</p>
                              </div>
                            </div>
                            <p className="font-bold text-forestGreen">${rate.price.toFixed(2)}</p>
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-forestGreen hover:bg-forestGreen/90"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 4: Payment */}
        <Card className={currentStep === 4 ? "border-forestGreen" : "bg-white"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forestGreen/10 text-forestGreen">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle className="text-barkBrown">Payment</CardTitle>
            </div>
          </CardHeader>
          {currentStep === 4 && (
            <CardContent className="space-y-4">
              <PaymentForm onSubmit={form.handleSubmit(onSubmit)} isLoading={isSubmitting} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(3)}
                className="w-full"
                disabled={isSubmitting}
              >
                Back
              </Button>
            </CardContent>
          )}
        </Card>
      </form>
    </Form>
  );
}
