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

// Pinterest icon (not available in lucide-react)
const Pinterest = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
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
                      <a
                        href={siteConfig.links.pinterest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-hunterOrange transition-colors"
                        aria-label="Pinterest"
                      >
                        <Pinterest className="h-6 w-6" />
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
