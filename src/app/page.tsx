'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import aboutImage from '@/public/about_img.jpg';
import ScrollReveal from "@/components/ScrollReveal"
// 🔹 Load PixelBlast only on the client (prevents SSR “window not defined”)
const PixelBlast = dynamic(() => import('@/components/PixelBlast'), { ssr: false });

const fadeInUp = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

// 💡 Benefit data
const benefits = [
  {
    icon: '🛡️',
    title: 'Data Sovereignty',
    description:
      'Gain true ownership and control over your personal data. You decide who can access it and for what purpose.',
  },
  {
    icon: '💰',
    title: 'Fair Compensation',
    description:
      'Get rewarded for the data you choose to share. Participate in a data economy that values your contribution.',
  },
  {
    icon: '👥',
    title: 'Community Governed',
    description:
      "Have a say in the platform's evolution. Kaivalya is governed by its members to ensure fairness and transparency.",
  },
  {
    icon: '🔒',
    title: 'Transparent & Secure',
    description:
      'We use blockchain to ensure transparency, immutability, and security for all data transactions.',
  },
  {
    icon: '🤖',
    title: 'Ethical AI',
    description:
      'Contribute to the development of ethical AI by providing consent-based, high-quality datasets.',
  },
  {
    icon: '🧬',
    title: 'Data Privacy',
    description:
      'Your privacy is paramount. We employ advanced encryption and anonymization techniques to protect it.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-transparent text-[#001c3d] font-comic">
      <Header />
      <main className="flex-1 overflow-hidden">
        {/* HERO SECTION — PixelBlast visible, correct z-order */}
        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-transparent">
          {/* PixelBlast (bottom-most) */}
          <div className="absolute inset-0 pointer-events-none -z-30">
            <PixelBlast
              className="absolute inset-0 w-full h-full"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              variant="circle"
              pixelSize={6}
              color="#A7D8FF"
              patternScale={2.5}
              patternDensity={1.5}
              pixelSizeJitter={2}
              enableRipples
              rippleSpeed={0.3}
              rippleThickness={0.52}
              rippleIntensityScale={1.2}
              liquid={false}
              speed={0.6}
              edgeFade={0.2}
              transparent={true} // make sure it's rendering visible pixels
            />
          </div>

          {/* Ambient pastel glow (above pixel canvas, but behind content) */}
          <div className="absolute inset-0 pointer-events-none -z-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(167,216,255,0.25)_0%,_transparent_70%)] blur-[100px]" />
          </div>

          {/* Foreground content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center container px-6 space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#003366] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.9)]">
              Own Your Data. <br /> Shape the Future.
            </h1>

            <p className="text-lg md:text-xl text-[#003366]/80 max-w-3xl mx-auto">
              Kaivalya is a decentralized DAO empowering individuals with ownership of their data — creating a transparent and equitable digital world.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-[#a8d8ff] text-[#003366] hover:bg-[#93c5fd] text-lg font-semibold shadow-md hover:scale-105 transition-transform">
                <Link href="/contribute/upload">Contribute Data <UploadCloud className="ml-2 h-6 w-6" /></Link>
              </Button>

              <Button asChild size="lg" variant="secondary" className="bg-white/80 hover:bg-white text-[#003366] text-lg font-semibold shadow-md hover:scale-105 transition-transform">
                <Link href="/marketplace">Browse Marketplace <ArrowRight className="ml-2 h-6 w-6" /></Link>
              </Button>
            </div>
          </motion.div>
        </section>


        {/* ===== KAI ScrollReveal Tagline (Fixed) ===== */}
        <section
          className="relative flex items-center justify-center min-h-[160vh] bg-[#f0f9ff] overflow-hidden"
          aria-label="KAI tagline"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(167,216,255,0.3)_0%,_transparent_70%)] blur-[120px]" />

          <div className="container mx-auto px-6 md:px-6">
            <ScrollReveal
              enableBlur={true}
              blurStrength={6}
              baseOpacity={0.1}
              baseRotation={3}
              containerClassName="flex flex-col items-center justify-center text-center"
              textClassName="text-4xl sm:text-5xl md:text-6xl font-bold leading-snug text-[#003366] max-w-[900px]"
            >
              {`
We asked AI who owns your data.  It said: “Not you.”
So we built Kai.      `}
            </ScrollReveal>
          </div>
        </section>




        {/* ===== ABOUT KAI (Expanded 3-Part Alternating Layout) ===== */}
<section id="about" className="py-20 md:py-32 bg-[#f0f9ff] space-y-32">
  {/* 🌀 1. Our Mission */}
  <div className="container mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6 order-2 lg:order-1"
    >
      <div className="inline-block rounded-full bg-[#a8d8ff]/40 px-4 py-2 text-sm font-bold text-[#003366] uppercase tracking-wider shadow-sm">
        Our Mission
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-[#003366] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)]">
        Decentralized Data Ownership for Everyone
      </h2>
      <p className="text-lg text-[#003366]/80 max-w-xl">
        At <span className="font-semibold text-[#003366]">Kaivalya Data DAO</span>, we believe your data should serve you — not corporations. 
        We’re building a transparent, equitable data economy where individuals reclaim ownership, benefit from their contributions, 
        and support the ethical evolution of AI. No middlemen. No exploitation. Just you and your data, finally aligned.
      </p>
    </motion.div>

    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex justify-center order-1 lg:order-2"
    >
      <Image
        src={aboutImage}
        alt="About KAI"
        width={600}
        height={500}
        className="rounded-3xl border-4 border-[#a8d8ff] shadow-[0_0_25px_rgba(168,216,255,0.7)] hover:scale-105 transition-transform"
      />
    </motion.div>
  </div>

  {/* 🌐 2. How KAI Works */}
  <div className="container mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex justify-center"
    >
      <Image
        src={aboutImage}
        alt="KAI Infrastructure"
        width={600}
        height={500}
        className="rounded-3xl border-4 border-[#a8d8ff] shadow-[0_0_25px_rgba(168,216,255,0.7)] hover:scale-105 transition-transform"
      />
    </motion.div>

    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="inline-block rounded-full bg-[#a8d8ff]/40 px-4 py-2 text-sm font-bold text-[#003366] uppercase tracking-wider shadow-sm">
        How It Works
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-[#003366] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)]">
        Powered by Blockchain, Secured by You
      </h2>
      <p className="text-lg text-[#003366]/80 max-w-xl">
        KAI uses decentralized storage and smart contracts to manage your data privately and transparently. 
        Contributors encrypt their datasets using <span className="font-semibold">Walrus</span>, share them through 
        <span className="font-semibold"> Sui-based smart contracts</span>, and earn KAI tokens through DAO governance. 
        Every transaction is visible, verifiable, and community-driven — zero trust required.
      </p>
    </motion.div>
  </div>

  {/* 🚀 3. The Vision */}
  <div className="container mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6 order-2 lg:order-1"
    >
      <div className="inline-block rounded-full bg-[#a8d8ff]/40 px-4 py-2 text-sm font-bold text-[#003366] uppercase tracking-wider shadow-sm">
        Our Vision
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-[#003366] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)]">
        Building the World’s First Data-Powered DAO
      </h2>
      <p className="text-lg text-[#003366]/80 max-w-xl">
        Kaivalya’s vision goes beyond ownership — it’s about creating a collective intelligence powered by consent-based data. 
        We see a future where communities control how information fuels innovation, where AI learns ethically, 
        and where data itself becomes a shared public good. The revolution starts with transparency, and it starts with you.
      </p>
    </motion.div>

    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex justify-center order-1 lg:order-2"
    >
      <Image
        src={aboutImage}
        alt="KAI Vision"
        width={600}
        height={500}
        className="rounded-3xl border-4 border-[#a8d8ff] shadow-[0_0_25px_rgba(168,216,255,0.7)] hover:scale-105 transition-transform"
      />
    </motion.div>
  </div>
</section>


        {/* BENEFITS */}
        <section id="benefits" className="py-20 md:py-32 bg-[#dbeafe]">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold text-[#003366] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.9)]">
              Why Join Kaivalya?
            </h2>
            <p className="text-xl text-[#003366]/80 max-w-3xl mx-auto">
              Participate in a DAO that gives you control, rewards, and a voice in shaping the data future.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-3 pt-16">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white/80 rounded-3xl border-2 border-[#a8d8ff] shadow-lg hover:shadow-[0_0_25px_rgba(168,216,255,0.7)] transition-all p-8 text-center hover:scale-105"
              >
                <div className="mb-4 text-[#0077cc] text-5xl">{benefit.icon}</div>
                <h3 className="text-2xl font-extrabold text-[#003366]">{benefit.title}</h3>
                <p className="mt-2 text-[#003366]/80">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
