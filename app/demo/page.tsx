'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Loader2, Phone, Play } from 'lucide-react';

/* -----------------------
   Zod schema (includes company)
----------------------- */
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +14155551234)'),
  company: z.string().min(1, 'Company name is required'),
  niche: z.enum(['property'], { errorMap: () => ({ message: 'Please select a niche' }) }),
  voice: z.enum(['eric', 'alexis', 'salma', 'mehmud'], { errorMap: () => ({ message: 'Please select a voice' }) }),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must provide consent to receive a call' }) }),
});
type FormData = z.infer<typeof formSchema>;

/* -----------------------
   Voice metadata (match /public)
----------------------- */
const VOICES = {
  eric: { 
    label: (
      <span className="flex items-center space-x-2">
        <span>Eric</span>
        <img src="/flags/us.png" alt="US Flag" className="w-5 h-5 rounded-sm" />
      </span>
    ),
    avatar: '/avatars/eric.jpg',
    sample: '/voices/eric.mp3',
  },
  alexis: { 
    label: (
      <span className="flex items-center space-x-2">
        <span>Alexis</span>
        <img src="/flags/us.png" alt="US Flag" className="w-5 h-5 rounded-sm" />
      </span>
    ),
    avatar: '/avatars/Alexis.jpg',
    sample: '/voices/Alexis.mp3',
  },
  salma:  { 
    label: (
      <span className="flex items-center space-x-2">
        <span>Salma</span>
        <img src="/flags/uk.png" alt="UK Flag" className="w-5 h-5 rounded-sm" />
      </span>
    ),
    avatar: '/avatars/salma.jpg',
    sample: '/voices/salma.mp3',
  },
  mehmud: { 
    label: (
      <span className="flex items-center space-x-2">
        <span>mehmud</span>
        <img src="/flags/uk.png" alt="UK Flag" className="w-5 h-5 rounded-sm" />
      </span>
    ),
    avatar: '/avatars/mehmud.jpg',
    sample: '/voices/mehmud.mp3',
  },
} as const;
type VoiceKey = keyof typeof VOICES;

/** ✅ Default export is a React component */
export default function DemoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors },
  reset,
} = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    niche: 'property', // 👈 set default here
  },
});

  const selectedNiche  = watch('niche');
  const selectedVoice  = watch('voice');
  const consentChecked = watch('consent');

  /* -----------------------
     Audio helpers
  ----------------------- */
  const stopAll = () => {
    Object.values(audioRefs.current).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
  };
  const playSample = (key: string) => {
    const a = audioRefs.current[key];
    if (!a) return;
    stopAll();
    a.loop = false;
    a.currentTime = 0;
    a.play().catch(() => {});
  };
  const blockSelect = (e: any) => { e.preventDefault(); e.stopPropagation(); };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/start-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to start call');

      toast({ title: '✅ Success!', description: 'Calling you now... please answer your phone!', duration: 5000 });
      reset();
    } catch (err) {
      toast({
        title: '❌ Error',
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
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
            <CardTitle className="text-3xl text-center text-white font-bold tracking-wide">AI Call Demo</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Experience our AI consultant. Fill out the form below and we’ll call you immediately.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input id="name" placeholder="John Doe"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('name')} disabled={isSubmitting} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('email')} disabled={isSubmitting} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+14155551234"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('phone')} disabled={isSubmitting} />
                <p className="text-xs text-slate-500">Must be in E.164 format (e.g., +14155551234)</p>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-300">Company Name</Label>
                <Input id="company" placeholder="Acme Inc."
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500"
                  {...register('company')} disabled={isSubmitting} />
                {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
              </div>

              {/* Niche */}
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-slate-300">Consultant Type</Label>
              <Select
                value={selectedNiche} // Default value set to Property Consultant
                onValueChange={(value) => setValue('niche', value as 'property', { shouldValidate: true })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="niche" className="bg-slate-800 border-slate-700 text-white">
                  <div className="text-left w-full">
                    <span>{selectedNiche === 'property' ? 'Property Consultant' : 'Select Consultant'}</span>
                  </div>
                </SelectTrigger>

                {/* Dropdown content */}
                <SelectContent className="bg-slate-800 text-white">
                  <SelectItem
                    value="property"
                    className="hover:bg-slate-200 hover:text-black transition-colors duration-200 ease-in-out"
                  >
                    Property Consultant
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.niche && <p className="text-sm text-red-500">{errors.niche.message}</p>}
            </div>

                {/* Voice */}
                <div className="space-y-2">
                  <Label htmlFor="voice" className="text-slate-300">Voice Preference</Label>
                  <Select
                    value={selectedVoice as VoiceKey | undefined}
                    onValueChange={(value) => setValue('voice', value as VoiceKey, { shouldValidate: true })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="voice" className="bg-slate-800 border-slate-700 text-white">
                      <div className="flex items-center gap-2">
                        {selectedVoice ? (
                          <>
                            <img
                              src={VOICES[selectedVoice as VoiceKey].avatar}
                              alt="Selected voice"
                              className="h-5 w-5 rounded-full object-cover border border-slate-700"
                            />
                            <span className="flex items-center gap-2">{VOICES[selectedVoice as VoiceKey].label}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Select voice</span>
                        )}
                      </div>
                    </SelectTrigger>

                    {/* Voice dropdown content */}
                    <SelectContent className="bg-slate-800 text-white">
                      {Object.entries(VOICES).map(([key, v]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="group relative pr-10 hover:bg-slate-200 hover:text-black transition-colors duration-200 ease-in-out"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={v.avatar}
                              alt={`${v.label} avatar`}
                              className="h-7 w-7 rounded-full object-cover border border-slate-700"
                            />
                            {/* Text will turn black when hovered */}
                            <span className="text-white group-hover:text-black flex items-center gap-2 transition-colors duration-200 ease-in-out">
                              {v.label}
                            </span>
                          </div>

                          {/* Play Button */}
                          <button
                            type="button"
                            tabIndex={-1}
                            aria-label={`Preview ${v.label}`}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border border-slate-600 hover:bg-slate-700 flex items-center justify-center"
                            onPointerDown={blockSelect}
                            onPointerUp={blockSelect}
                            onMouseDown={blockSelect}
                            onMouseUp={blockSelect}
                            onKeyDown={blockSelect}
                            onClick={(e) => { blockSelect(e); playSample(key); }}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>

                          <audio ref={(el) => (audioRefs.current[key] = el)} src={v.sample} preload="auto" />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.voice && <p className="text-sm text-red-500">{errors.voice.message}</p>}
                </div>

              {/* Consent */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="consent"
                  checked={!!consentChecked}
                  onCheckedChange={(checked) => setValue('consent', checked as true, { shouldValidate: true })}
                  disabled={isSubmitting}
                  className="border-slate-600 data-[state=checked]:bg-blue-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="consent" className="text-sm font-normal leading-snug cursor-pointer text-slate-300">
                    I consent to receiving a call from the AI consultant for demonstration purposes. It will just be a 2 minute call for demo.
                  </Label>
                  {errors.consent && <p className="text-sm text-red-500">{errors.consent.message}</p>}
                </div>
              </div>

              {/* Submit */}
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
