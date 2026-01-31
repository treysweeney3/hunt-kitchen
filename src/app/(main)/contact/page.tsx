'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site';
import type { ContactFormInput } from '@/types';

// TikTok icon (not available in lucide-react)
const TikTok = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

type InquiryType = 'general' | 'business';
type CollaborationType = 'sponsorship' | 'recipe' | 'product' | 'other' | '';

interface ExtendedFormData extends ContactFormInput {
  companyName: string;
  jobTitle: string;
  collaborationType: CollaborationType;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>('general');
  const [formData, setFormData] = useState<ExtendedFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    companyName: '',
    jobTitle: '',
    collaborationType: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call
      // Include inquiryType in submission: { ...formData, inquiryType }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        companyName: '',
        jobTitle: '',
        collaborationType: '',
      });
      setInquiryType('general');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const faqs = [
    {
      question: 'How do I access premium recipes?',
      answer:
        'Premium recipes are available to all registered members. Simply create a free account to access our full collection of wild game recipes.',
    },
    {
      question: 'Do you offer custom recipe development?',
      answer:
        'Yes! We offer custom recipe development services for special events, cookbooks, and commercial projects. Please contact us with details about your project.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached. Visit our Returns page for full details.',
    },
    {
      question: 'How long does shipping take?',
      answer:
        'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery. Free shipping is offered on orders over $50.',
    },
    {
      question: 'Can I submit my own recipes?',
      answer:
        'We love receiving recipes from our community! Please email us with your recipe, including photos if available, and we may feature it on our site.',
    },
    {
      question: 'Do you offer hunting guides or field dressing tutorials?',
      answer:
        'While we focus primarily on cooking, we do offer basic field dressing and meat processing guides. Check our blog for detailed tutorials.',
    },
  ];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-forestGreen sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-slate">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-forestGreen">
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  {inquiryType === 'business'
                    ? "Tell us about your brand and collaboration ideas."
                    : "Have a question or comment? We'd love to hear from you."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type *</Label>
                    <Select
                      value={inquiryType}
                      onValueChange={(value: InquiryType) => setInquiryType(value)}
                    >
                      <SelectTrigger id="inquiryType">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="business">Brand / Business Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional Business Fields */}
                  {inquiryType === 'business' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company/Brand Name *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Your company or brand name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Your Role/Title</Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          type="text"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          placeholder="e.g. Marketing Manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collaborationType">Collaboration Type *</Label>
                        <Select
                          value={formData.collaborationType}
                          onValueChange={(value: CollaborationType) =>
                            setFormData((prev) => ({ ...prev, collaborationType: value }))
                          }
                        >
                          <SelectTrigger id="collaborationType">
                            <SelectValue placeholder="Select collaboration type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sponsorship">Sponsorship</SelectItem>
                            <SelectItem value="recipe">Recipe Development</SelectItem>
                            <SelectItem value="product">Product Collaboration</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Email & Social */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-forestGreen">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-forestGreen mt-0.5" />
                    <div>
                      <p className="font-semibold text-forestGreen">Email</p>
                      <a
                        href={`mailto:${siteConfig.links.email}`}
                        className="text-slate hover:text-hunterOrange transition-colors"
                      >
                        {siteConfig.links.email}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-forestGreen">Follow Us</p>
                    <div className="flex gap-4">
                      <a
                        href={siteConfig.links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-hunterOrange transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-6 w-6" />
                      </a>
                      <a
                        href={siteConfig.links.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-hunterOrange transition-colors"
                        aria-label="TikTok"
                      >
                        <TikTok className="h-6 w-6" />
                      </a>
                      <a
                        href={siteConfig.links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-hunterOrange transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-6 w-6" />
                      </a>
                      <a
                        href={siteConfig.links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-hunterOrange transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-forestGreen">
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate">
                    We typically respond to all inquiries within 24-48 hours during
                    business days. For urgent matters, please indicate so in your
                    message.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="mb-8 font-serif text-3xl font-bold text-forestGreen text-center">
              Frequently Asked Questions
            </h2>
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-semibold text-forestGreen">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
