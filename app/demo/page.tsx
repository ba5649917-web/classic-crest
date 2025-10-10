'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Loader2, Phone } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +14155551234)'),
  niche: z.enum(['property', 'edu_consultant'], {
    errorMap: () => ({ message: 'Please select a niche' }),
  }),
  voice: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Please select a voice' }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must provide consent to receive a call' }),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedNiche = watch('niche');
  const selectedVoice = watch('voice');
  const consentChecked = watch('consent');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/start-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start call');
      }

      toast({
        title: '✅ Success!',
        description: 'Calling you now... please answer your phone!',
        duration: 5000,
      });

      reset();
    } catch (error) {
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] flex items-center justify-center p-4 text-white">
        <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-800 shadow-lg shadow-blue-900/30">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Phone className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center text-white font-bold tracking-wide">
              AI Call Demo
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Experience our AI consultant. Fill out the form below and we’ll call you immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+14155551234"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('phone')}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500">
                  Must be in E.164 format (e.g., +14155551234)
                </p>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Niche */}
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-slate-300">Consultant Type</Label>
                <Select
                  value={selectedNiche}
                  onValueChange={(value) => setValue('niche', value as 'property' | 'edu_consultant', { shouldValidate: true })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="niche" className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select consultant type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white">
                    <SelectItem value="property">Property Consultant</SelectItem>
                    <SelectItem value="edu_consultant">Education Consultant</SelectItem>
                  </SelectContent>
                </Select>
                {errors.niche && <p className="text-sm text-red-500">{errors.niche.message}</p>}
              </div>

              {/* Voice */}
              <div className="space-y-2">
                <Label htmlFor="voice" className="text-slate-300">Voice Preference</Label>
                <Select
                  value={selectedVoice}
                  onValueChange={(value) => setValue('voice', value as 'male' | 'female', { shouldValidate: true })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="voice" className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white">
                    <SelectItem value="male">Male Voice</SelectItem>
                    <SelectItem value="female">Female Voice</SelectItem>
                  </SelectContent>
                </Select>
                {errors.voice && <p className="text-sm text-red-500">{errors.voice.message}</p>}
              </div>

              {/* Consent */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) =>
                    setValue('consent', checked as true, { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                  className="border-slate-600 data-[state=checked]:bg-blue-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-normal leading-snug cursor-pointer text-slate-300"
                  >
                    I consent to receiving a call from the AI consultant for demonstration purposes.
                  </Label>
                  {errors.consent && <p className="text-sm text-red-500">{errors.consent.message}</p>}
                </div>
              </div>

              {/* Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-200"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calling you now... please answer!
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Start AI Call
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </>
  );
}
