'use client'
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  Database,
  GitBranch,
  Lock,
  MessageCircle,
  ShieldCheck,
  Twitter,
  UploadCloud,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import PixelBlast from '@/components/PixelBlast';
import aboutImage from "@/public/about_img.jpg"
import logo from '@/public/logo.png'
const benefits = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Data Sovereignty',
    description: 'Gain true ownership and control over your personal data. You decide who can access it and for what purpose.',
  },
  {
    icon: <CircleDollarSign className="h-8 w-8 text-primary" />,
    title: 'Fair Compensation',
    description: 'Get rewarded for the data you choose to share. Participate in a data economy that values your contribution.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Community Governed',
    description: 'Have a say in the future of the platform. KAI is governed by its members, ensuring it serves the community\'s interests.',
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: 'Transparent & Secure',
    description: 'Leveraging blockchain technology for unparalleled transparency and security in all data transactions.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>,
    title: 'Ethical AI',
    description: 'Contribute to the development of ethical AI by providing access to high-quality, consent-based data.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>,
    title: 'Data Privacy',
    description: 'Your privacy is paramount. We use cutting-edge techniques to protect your identity and sensitive information.',
  },
];

const stats = [
  { value: '1,200+', label: 'Contributors' },
  { value: '50TB+', label: 'Data Donated' },
  { value: '$1.5M+', label: 'Value Generated' },
  { value: '250+', label: 'Datasets' },
];

const featuredDatasets = [
  { id: '1', name: 'Global Climate Data', description: 'Comprehensive climate metrics from 2000-2024.', category: 'Environment', price: 500, contributors: 150 },
  { id: '2', name: 'Medical Imaging Scans', description: 'A large collection of anonymized MRI scans.', category: 'Healthcare', price: 1200, contributors: 80 },
  { id: '3', name: 'Consumer Spending Habits', description: 'Aggregated retail spending data across various sectors.', category: 'Finance', price: 800, contributors: 300 },
];


export default function Home() {

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex items-center overflow-hidden">
          {/* 🔹 PixelBlast Background */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              className="w-full h-full"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
              variant="circle"
              pixelSize={6}
              color="#A7D8FF" // light blue background
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid={false}
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
          </div>

          {/* 🔹 Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/70 via-background/50 to-transparent" />

          {/* 🔹 Main Content */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Left Text Block */}
            <div className="flex-2 flex flex-col items-start text-left space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Own Your Data. <br /> Shape the Future.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Kaivalya is a decentralized autonomous organization (DAO) dedicated to empowering individuals with ownership of their data.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/contribute/upload">
                    Contribute Data <UploadCloud className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="secondary">
                  <Link href="/marketplace">
                    Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>



        {/* Stats Section */}
        <section id="stats" className="w-full py-12 md:py-24 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
              {stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About KAI Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">
                  Our Mission
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Decentralized Data Ownership for All
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  At KAI Data DAO, we believe that your data is your property. Our mission is to build a new data economy where individuals have full control and can benefit from the value their data generates. We're creating a transparent, secure, and community-governed platform for data sharing and monetization.
                </p>
              </div>
              <div className="flex justify-center">
                {aboutImage && (
                  <Image
                    src={aboutImage}
                    alt={"About Image"}
                    width={600}
                    height={500}
                    className="rounded-xl object-cover shadow-2xl"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Datasets Section */}
        <section id="datasets" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">
                  Featured Datasets
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Explore Our Data Marketplace
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover valuable datasets contributed by our community. All purchases help reward the data contributors and fund the DAO.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-12">
              {featuredDatasets.map((dataset) => (
                <Card key={dataset.id} className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-background">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-lg">{dataset.name}</span>
                      <Badge variant="secondary">{dataset.category}</Badge>
                    </CardTitle>
                    <CardDescription>{dataset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 font-semibold">
                        <CircleDollarSign className="h-4 w-4 text-primary" />
                        <span>{dataset.price} KAI</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{dataset.contributors} contributors</span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/marketplace/${dataset.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* Key Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">
                  Key Benefits
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Join Kaivalya?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Participating in the KAI Data DAO offers tangible benefits for data sovereignty, compensation, and governance.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              {benefits.map((benefit, index) => (
                <BenefitCard key={index} {...benefit} />
              ))}
            </div>
          </div>
        </section>

        {/* Get Involved Section */}
        <section id="get-involved" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Join the Data Revolution?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Become a part of our growing community and help shape the future of data ownership.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="flex justify-center gap-4 flex-wrap">
                <Button asChild size="lg">
                  <Link href="#">
                    <MessageCircle className="mr-2 h-5 w-5" /> Join our Discord
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <BookOpen className="mr-2 h-5 w-5" /> Read the Docs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-background hover:bg-card">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
