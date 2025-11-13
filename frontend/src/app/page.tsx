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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ScrollReveal from "@/components/ScrollReveal"
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

const aboutImage = PlaceHolderImages.find(p => p.id === 'about-illustration-1');
const infraImage = PlaceHolderImages.find(p => p.id === 'about-illustration-2');
const visionImage = PlaceHolderImages.find(p => p.id === 'about-illustration-3');


export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {/* HERO SECTION — PixelBlast visible, correct z-order */}
        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-transparent">
          {/* PixelBlast (bottom-most) */}
          <div className="absolute inset-0 pointer-events-none -z-30">
            <PixelBlast
              className="absolute inset-0 w-full h-full"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              variant="circle"
              pixelSize={6}
              color="#dbeafe"
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
              transparent={false} 
            />
          </div>

          {/* Ambient pastel glow (above pixel canvas, but behind content) */}
          <div className="absolute inset-0 pointer-events-none -z-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(199,228,255,0.25)_0%,_transparent_70%)] blur-[100px]" />
          </div>

          {/* Foreground content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center container px-6 space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground drop-shadow-lg">
              Own Your Data. <br /> Shape the Future.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Kaivalya is a decentralized DAO empowering individuals with ownership of their data — creating a transparent and equitable digital world.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary/90 text-primary-foreground hover:bg-primary text-lg font-semibold shadow-md hover:scale-105 transition-transform">
                <Link href="/contribute/upload">Contribute Data <UploadCloud className="ml-2 h-6 w-6" /></Link>
              </Button>

              <Button asChild size="lg" variant="secondary" className="bg-secondary/80 hover:bg-secondary text-secondary-foreground text-lg font-semibold shadow-md hover:scale-105 transition-transform">
                <Link href="/marketplace">Browse Marketplace <ArrowRight className="ml-2 h-6 w-6" /></Link>
              </Button>
            </div>
          </motion.div>
        </section>


        {/* ===== KAI ScrollReveal Tagline (Fixed) ===== */}
        <section
          className="relative flex items-center justify-center min-h-[150vh] bg-background overflow-hidden"
          aria-label="KAI tagline"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(199,228,255,0.15)_0%,_transparent_70%)] blur-[120px]" />

          <div className="container mx-auto px-6 md:px-6">
            <ScrollReveal
              enableBlur={true}
              blurStrength={6}
              baseOpacity={0.1}
              baseRotation={3}
              containerClassName="flex flex-col items-center justify-center text-center"
              textClassName="text-4xl sm:text-5xl md:text-6xl font-bold leading-snug text-foreground max-w-[900px]"
            >
              {`
We asked AI who owns your data.  It said: “Not you.”
So we built Kai.      `}
            </ScrollReveal>
          </div>
        </section>




        {/* ===== ABOUT KAI (Expanded 3-Part Alternating Layout) ===== */}
        <section id="about" className="py-20 md:py-32 bg-background space-y-32">
          {/* 🌀 1. Our Mission */}
          <div className="container mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6 order-2 lg:order-1"
            >
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary uppercase tracking-wider shadow-sm">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-sm">
                Decentralized Data Ownership for Everyone
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                At <span className="font-semibold text-foreground">Kaivalya Data DAO</span>, we believe your data should serve you — not corporations.
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
              {aboutImage && <Image
                 data-ai-hint={aboutImage.imageHint}
                 src={aboutImage.imageUrl}
                 alt={aboutImage.description}
                 width={600}
                 height={500}
                 className="rounded-3xl border-4 border-primary/20 shadow-lg hover:scale-105 transition-transform"
              />}
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
              {infraImage && <Image
                data-ai-hint={infraImage.imageHint}
                src={infraImage.imageUrl}
                alt={infraImage.description}
                width={600}
                height={500}
                className="rounded-3xl border-4 border-primary/20 shadow-lg hover:scale-105 transition-transform"
              />}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary uppercase tracking-wider shadow-sm">
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-sm">
                Powered by Blockchain, Secured by You
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
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
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary uppercase tracking-wider shadow-sm">
                Our Vision
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-sm">
                Building the World’s First Data-Powered DAO
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
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
             {visionImage && <Image
                data-ai-hint={visionImage.imageHint}
                src={visionImage.imageUrl}
                alt={visionImage.description}
                width={600}
                height={500}
                className="rounded-3xl border-4 border-primary/20 shadow-lg hover:scale-105 transition-transform"
              />}
            </motion.div>
          </div>
        </section>


        <section className='h-[10vh] bg-background'></section>
        
        {/* ===== END CTA SECTION ===== */}
        <section className="relative w-full flex flex-col items-center justify-center text-center bg-background overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-10 space-y-4 px-6 py-24 md:py-32 bg-background w-full"
          >
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              You’ve scrolled this far...
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Maybe it’s a sign! <br />
              Join{" "}
              <span className="font-semibold text-primary">Kaivalya</span> and help
              build the future of ethical data ownership.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              className="pt-6"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-md hover:scale-105 transition-transform"
              >
                <Link href="/dashboard">
                  Join KAI
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
