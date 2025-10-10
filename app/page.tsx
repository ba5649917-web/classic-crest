'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import { ArrowRight, Clock, PhoneCall, TrendingUp, Users, Sparkles, Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-black via-[#0a0f2c] to-[#001f3f] text-white overflow-hidden">
      {/* Floating Glowing Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 100, 0], y: [0, 100, -50, 0], scale: [1, 0.8, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-6">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Boost Your <span className="text-blue-500">Sales</span>
          <br />
          with Smart AI Calling Agents
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl h-[60px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Typewriter
            words={[
              'Convert leads.',
              'Save time.',
              'Grow faster with AI calls.',
            ]}
            loop
            cursor
            cursorStyle="|"
            typeSpeed={50}
            deleteSpeed={30}
            delaySpeed={1500}
          />
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Button
            onClick={() => router.push('/demo')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            Try a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose Our AI Calling Agent?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: PhoneCall, title: 'Instant Calling', desc: 'Reach leads instantly with real-time AI voice calls — no waiting, no manual work.' },
            { icon: Clock, title: 'Save Time & Costs', desc: 'Automate repetitive calling tasks and let your team focus on closing deals.' },
            { icon: TrendingUp, title: 'Boost Conversion', desc: 'AI agents engage leads effectively, increasing conversion rates by up to 45%.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="bg-[#0b132b] hover:bg-[#101a3f] transition rounded-2xl p-8 shadow-xl border border-blue-900/30 backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <f.icon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-20 px-6 bg-[#04091f]/60 backdrop-blur-sm">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Users, title: '1. Add Your Leads', desc: 'Easily upload or enter lead numbers through our platform.' },
            { icon: Sparkles, title: '2. AI Makes Calls', desc: 'Our intelligent agent makes outbound calls instantly.' },
            { icon: Zap, title: '3. You Close Deals', desc: 'You get warm leads & conversations ready to close.' },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="text-center p-6 rounded-xl bg-[#0b132b] border border-blue-900/30 shadow-lg hover:bg-[#101a3f]"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
            >
              <s.icon className="h-14 w-14 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Benefits for Your Business
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            'Available 24/7 to handle calls automatically',
            'Eliminates manual follow-up burden',
            'Handles thousands of calls simultaneously',
            'Custom voice for your business identity',
            'AI adapts based on customer responses',
            'Secure & reliable call handling',
          ].map((b, i) => (
            <motion.div
              key={i}
              className="flex items-start space-x-3 bg-[#0b132b] p-4 rounded-lg border border-blue-900/30 hover:bg-[#101a3f]"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CheckCircle2 className="text-blue-500 h-6 w-6 flex-shrink-0 mt-1" />
              <p className="text-gray-300">{b}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-20 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Start Automating Your Sales Calls Today
        </motion.h2>
        <motion.p
          className="text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          Empower your team with AI-powered calling that converts leads into paying customers.
        </motion.p>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            onClick={() => router.push('/demo')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6 rounded-full shadow-lg transition-all duration-300"
          >
            Try a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-blue-900/30">
        © {new Date().getFullYear()} AI Calling Agent — All Rights Reserved
      </footer>
    </main>
  );
}
