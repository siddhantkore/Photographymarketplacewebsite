import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ProductCard } from '../components/product-card';
import { productsApi } from '../services/api';
import type { Product } from '../lib/mock-data';
import {
  Camera,
  User,
  Tent,
  Building2,
  Mountain,
  Package,
  Award,
  Download,
  ShieldCheck,
  BadgeCheck,
  Lock,
  MessageCircle,
  Clock,
  TrendingUp,
  CalendarDays,
  Image,
} from 'lucide-react';

/* ──────────────────────────────────────────
   Hero slider data
────────────────────────────────────────── */
const heroSlides = [
  {
    id: 1,
    image: '/images/hero/wedding.png',
    tag: 'Wedding Photography',
    title: 'Capture Your\nForever Moments',
    subtitle:
      'Timeless wedding photography that tells the story of your most important day.',
  },
  {
    id: 2,
    image: '/images/hero/portrait.png',
    tag: 'Portrait Sessions',
    title: 'Your Story,\nBeautifully Told',
    subtitle:
      'Professional portrait sessions with dramatic lighting and premium editing.',
  },
  {
    id: 3,
    image: '/images/hero/landscape.png',
    tag: 'Landscape & Nature',
    title: 'The World\nThrough Our Lens',
    subtitle:
      'Breathtaking landscape photography available as premium digital downloads.',
  },
  {
    id: 4,
    image: '/images/hero/commercial.png',
    tag: 'Commercial Photography',
    title: 'Elevate Your\nBrand Visuals',
    subtitle:
      'Corporate and product photography that drives engagement and builds trust.',
  },
  {
    id: 5,
    image: '/images/hero/product.png',
    tag: 'Product Photography',
    title: 'Make Your Products\nIrresistible',
    subtitle:
      'Studio-quality product photography with perfect lighting and composition.',
  },
];

/* ──────────────────────────────────────────
   Services data
────────────────────────────────────────── */
const services = [
  {
    icon: Camera,
    color: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    name: 'Wedding Photography',
    desc: 'Comprehensive wedding coverage from preparations to reception. Every emotion captured beautifully.',
    slug: 'wedding',
  },
  {
    icon: User,
    color: 'linear-gradient(135deg,#ede9fe,#c4b5fd)',
    name: 'Portrait Sessions',
    desc: 'Individual, family, and professional portrait sessions in studio or outdoor locations.',
    slug: 'portrait',
  },
  {
    icon: Tent,
    color: 'linear-gradient(135deg,#fee2e2,#fca5a5)',
    name: 'Events & Corporate',
    desc: 'Conferences, product launches, seminars and corporate events documented professionally.',
    slug: 'events',
  },
  {
    icon: Building2,
    color: 'linear-gradient(135deg,#d1fae5,#6ee7b7)',
    name: 'Commercial Shoots',
    desc: 'Brand-building commercial photography for advertising, catalogues, and digital media.',
    slug: 'commercial',
  },
  {
    icon: Mountain,
    color: 'linear-gradient(135deg,#dbeafe,#93c5fd)',
    name: 'Landscape & Travel',
    desc: 'Stunning landscape and travel photography available as high-resolution digital downloads.',
    slug: 'landscape',
  },
  {
    icon: Package,
    color: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    name: 'Product Photography',
    desc: 'Clean, professional product images optimised for e-commerce, packaging, and print.',
    slug: 'product',
  },
];

/* ──────────────────────────────────────────
   Why Choose Us data
────────────────────────────────────────── */
const whyItems = [
  { icon: Award, title: 'Award-Winning Studio', desc: '50+ national and international photography awards since 2016.', color: '#6366f1' },
  { icon: Download, title: 'Instant Download', desc: 'Purchase and download high-resolution photos instantly in multiple formats.', color: '#0ea5e9' },
  { icon: ShieldCheck, title: 'Royalty-Free License', desc: 'One-time purchase grants you full commercial and personal usage rights.', color: '#10b981' },
  { icon: BadgeCheck, title: '100% Satisfaction', desc: 'Not happy? We offer a hassle-free refund within 7 days of purchase.', color: '#f59e0b' },
  { icon: Lock, title: 'Secure Payments', desc: 'Bank-grade encryption with multiple trusted payment options available.', color: '#8b5cf6' },
  { icon: MessageCircle, title: '24/7 Support', desc: 'Our dedicated support team is always ready to help with any queries.', color: '#ec4899' },
];

/* ──────────────────────────────────────────
   Testimonials data
────────────────────────────────────────── */
const testimonials = [
  {
    avatar: 'PK',
    avatarBg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    name: 'Priya Kapoor',
    role: 'Bride — Delhi',
    quote:
      '"Like Photo Studio made our wedding day feel magical. Every single photograph is a masterpiece — the lighting, the emotions, the candid moments. We will treasure these forever."',
  },
  {
    avatar: 'RS',
    avatarBg: 'linear-gradient(135deg,#a855f7,#3b82f6)',
    name: 'Rohan Sharma',
    role: 'Marketing Director, TechVentures',
    quote:
      '"We hired them for our product launch. The commercial shots exceeded our expectations — professional, creative, and delivered ahead of schedule. Our campaign results improved by 40%."',
  },
  {
    avatar: 'AM',
    avatarBg: 'linear-gradient(135deg,#10b981,#3b82f6)',
    name: 'Anika Mehta',
    role: 'Fashion Blogger',
    quote:
      '"The portrait session was an experience in itself. The photographer has an incredible eye for detail and made me feel completely at ease. The final images were absolutely stunning."',
  },
];

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */
export function HomePage() {
  // Hero slider state
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Auto-advance slider ── */
  const SLIDE_DURATION = 5000;

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    resetProgress();
    setTimeout(() => setIsAnimating(false), 900);
  };

  const next = () => goTo((current + 1) % heroSlides.length);
  const prev = () => goTo((current - 1 + heroSlides.length) % heroSlides.length);

  const resetProgress = () => {
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (progressRef.current) {
            progressRef.current.style.transition = `width ${SLIDE_DURATION}ms linear`;
            progressRef.current.style.width = '100%';
          }
        });
      });
    }
  };

  useEffect(() => {
    resetProgress();
    slideTimer.current = setInterval(next, SLIDE_DURATION);
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [current]); // eslint-disable-line

  /* ── Scroll reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('lps-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.lps-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  /* ── Load products ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [latestRes]: any = await Promise.all([
          productsApi.getAll({ page: 1, limit: 30, sort: 'uploadDate', order: 'desc' }),
        ]);
        if (latestRes?.success && latestRes?.data?.products) {
          setProducts(latestRes.data.products);
        }
      } catch {
        // silently fail — products are bonus content
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestProducts = useMemo(() => products.slice(0, 4), [products]);
  const popularProducts = useMemo(
    () => [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4),
    [products]
  );

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════ HERO SLIDER ══════════ */}
      <section className="lps-hero" aria-label="Featured Photography">
        {/* Progress bar */}
        <div ref={progressRef} className="lps-slide-progress" />

        {/* Slides */}
        <div
          className="lps-hero-slides"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {heroSlides.map((slide, i) => (
            <div key={slide.id} className={`lps-hero-slide${i === current ? ' lps-active' : ''}`}>
              <img
                src={slide.image}
                alt={slide.tag}
                loading={i === 0 ? 'eager' : 'lazy'}
                width="1920"
                height="1080"
              />
              <div className="lps-hero-overlay" />
            </div>
          ))}
        </div>

        {/* Content — renders only active slide's text */}
        <div className="lps-hero-content">
          <span className="lps-hero-badge">
            <span className="lps-hero-badge-dot" />
            {heroSlides[current].tag}
          </span>
          <h1
            className="lps-hero-title"
            style={{ fontFamily: "'Playfair Display', serif", whiteSpace: 'pre-line' }}
          >
            {heroSlides[current].title.split('\n').map((line, i) =>
              i === 0 ? (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ) : (
                <span key={i} className="lps-hero-title-accent">
                  {line}
                </span>
              )
            )}
          </h1>
          <p className="lps-hero-subtitle">{heroSlides[current].subtitle}</p>
          <div className="lps-hero-btns">
            <Link to="/explore" className="lps-btn-primary">
              Explore Gallery <span>→</span>
            </Link>
            <Link to="/services" className="lps-btn-ghost">
              Book a Session <Camera size={18} />
            </Link>
          </div>
        </div>

        {/* Arrows */}
        <button className="lps-hero-arrow lps-hero-arrow-prev" onClick={prev} aria-label="Previous slide">
          ‹
        </button>
        <button className="lps-hero-arrow lps-hero-arrow-next" onClick={next} aria-label="Next slide">
          ›
        </button>

        {/* Dots */}
        <div className="lps-hero-dots" role="tablist" aria-label="Slide navigation">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`lps-dot${i === current ? ' lps-dot-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              role="tab"
              aria-selected={i === current}
            />
          ))}
        </div>
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="lps-stats" aria-label="Studio Statistics">
        <div className="lps-container">
          <div className="lps-stats-grid">
            {[
              { number: '10,000+', label: 'Premium Photos' },
              { number: '500+', label: 'Happy Clients' },
              { number: '8+', label: 'Years of Excellence' },
              { number: '50+', label: 'Awards Won' },
            ].map((stat, i) => (
              <div key={i} className="lps-stat-item lps-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="lps-stat-number">{stat.number}</div>
                <div className="lps-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section className="lps-section lps-services" aria-labelledby="services-heading">
        <div className="lps-container">
          <div className="lps-section-header lps-center lps-reveal">
            <span className="lps-section-tag">What We Offer</span>
            <h2
              id="services-heading"
              className="lps-section-title"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Photography Services<br />Tailored for Every Occasion
            </h2>
            <p className="lps-section-subtitle">
              From intimate portraits to grand celebrations, we deliver world-class photography
              with passion, precision, and an eye for storytelling.
            </p>
          </div>

          <div className="lps-services-grid">
            {services.map((svc, i) => {
              const IconComponent = svc.icon;
              return (
                <Link
                  key={svc.slug}
                  to="/services"
                  className="lps-service-card lps-reveal"
                  style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
                >
                  <div
                    className="lps-service-icon-wrap"
                    style={{ background: svc.color }}
                    aria-hidden="true"
                  >
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <div className="lps-service-name">{svc.name}</div>
                  <p className="lps-service-desc">{svc.desc}</p>
                  <span className="lps-service-link">
                    Learn More <span>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <section className="lps-section lps-why" aria-labelledby="why-heading">
        <div className="lps-container">
          <div className="lps-section-header lps-reveal">
            <span className="lps-section-tag" style={{ color: '#f59e0b' }}>
              Why Like Photo Studio
            </span>
            <h2
              id="why-heading"
              className="lps-section-title"
              style={{ fontFamily: "'Playfair Display', serif", color: 'black' }}
            >
              Excellence in Every<br />Frame We Deliver
            </h2>
            <p className="lps-section-subtitle" style={{ color: 'black' }}>
              We combine technical expertise with artistic vision to create photographs that
              resonate, inspire, and stand the test of time.
            </p>
          </div>

          <div className="lps-why-grid">
            {whyItems.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={i}
                  className="lps-why-item lps-reveal"
                  style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
                >
                  <div className="lps-why-icon" aria-hidden="true" style={{ color: item.color }}>
                    <IconComponent size={28} strokeWidth={1.5} />
                  </div>
                  <div className="lps-why-title">{item.title}</div>
                  <p className="lps-why-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ LATEST UPLOADS ══════════ */}
      {(loading || latestProducts.length > 0) && (
        <section className="lps-section lps-products" aria-labelledby="latest-heading">
          <div className="lps-container">
            <div className="lps-products-header lps-reveal">
              <div className="lps-products-title" id="latest-heading">
                <Clock size={20} strokeWidth={2} className="inline align-middle mr-2" /> Latest Uploads
              </div>
              <Link to="/explore?sort=newest" className="lps-view-all">
                View All <span>→</span>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {latestProducts.map((product, i) => (
                  <div key={product.id} className="lps-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ MOST POPULAR ══════════ */}
      {(loading || popularProducts.length > 0) && (
        <section
          className="lps-section"
          aria-labelledby="popular-heading"
        >
          <div className="lps-container">
            <div className="lps-products-header lps-reveal">
              <div className="lps-products-title" id="popular-heading">
                <TrendingUp size={20} strokeWidth={2} className="inline align-middle mr-2" /> Most Popular
              </div>
              <Link to="/explore?sort=popular" className="lps-view-all">
                View All <span>→</span>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {popularProducts.map((product, i) => (
                  <div key={product.id} className="lps-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="lps-section lps-testimonials" aria-labelledby="testimonials-heading">
        <div className="lps-container">
          <div className="lps-section-header lps-center lps-reveal">
            <span className="lps-section-tag">Client Stories</span>
            <h2
              id="testimonials-heading"
              className="lps-section-title"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Words From Our<br />Happy Clients
            </h2>
            <p className="lps-section-subtitle">
              Real experiences from real clients who trusted us with their most important moments.
            </p>
          </div>

          <div className="lps-testimonials-grid">
            {testimonials.map((t, i) => (
              <article
                key={i}
                className="lps-testimonial-card lps-reveal"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="lps-testimonial-stars" aria-label="5 star rating">
                  {'★★★★★'}
                </div>
                <blockquote className="lps-testimonial-quote">{t.quote}</blockquote>
                <footer className="lps-testimonial-author">
                  <div
                    className="lps-testimonial-avatar"
                    style={{ background: t.avatarBg }}
                    aria-hidden="true"
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="lps-testimonial-name">{t.name}</div>
                    <div className="lps-testimonial-role">{t.role}</div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="lps-cta" aria-label="Call to action">
        <h2
          className="lps-cta-title lps-reveal"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Ready to Capture Your Story?
        </h2>
        <p className="lps-cta-subtitle lps-reveal lps-reveal-delay-1">
          Book a session with our award-winning photographers, or browse thousands of
          premium digital photos ready for instant download.
        </p>
        <div className="lps-cta-btns lps-reveal lps-reveal-delay-2">
          <Link to="/services" className="lps-btn-white">
            <CalendarDays size={18} className="inline align-middle mr-1" /> Book a Session
          </Link>
          <Link to="/explore" className="lps-btn-outline-white">
            <Image size={18} className="inline align-middle mr-1" /> Browse Gallery
          </Link>
        </div>
      </section>
    </div>
  );
}
