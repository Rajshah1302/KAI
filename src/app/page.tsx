import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  Lock,
  MessageCircle,
  ShieldCheck,
  Twitter,
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
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
    title: 'Ethical AI',
    description: 'Contribute to the development of ethical AI by providing access to high-quality, consent-based data.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
    title: 'Data Privacy',
    description: 'Your privacy is paramount. We use cutting-edge techniques to protect your identity and sensitive information.',
  },
];


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-illustration');

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-center">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-background/30" />
          <div className="container relative px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Own Your Data. Shape the Future.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Kaivalya is a decentralized autonomous organization (DAO) dedicated to empowering individuals with ownership of their data.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg">
                  <Link href="#about">
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About KAI Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
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
                      src={aboutImage.imageUrl}
                      alt={aboutImage.description}
                      width={600}
                      height={500}
                      className="rounded-xl object-cover shadow-2xl"
                      data-ai-hint={aboutImage.imageHint}
                    />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
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
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
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
                <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <MessageCircle className="mr-2 h-5 w-5" /> Join Discord
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <Twitter className="mr-2 h-5 w-5" /> Follow on X
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
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card">
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
