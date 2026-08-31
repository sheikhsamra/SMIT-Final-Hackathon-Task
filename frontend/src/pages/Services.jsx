import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  IconCreditCard,
  IconWrench,
  IconLock,
  IconChat,
  IconBox,
  IconSparkle,
  IconClock,
  IconUsers,
} from "../components/Icons";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    Icon: IconCreditCard,
    color: "sc-blue",
    title: "Billing",
    desc: "Refunds, duplicate charges, invoices, and subscription questions.",
  },
  {
    Icon: IconWrench,
    color: "sc-amber",
    title: "Technical",
    desc: "Bugs, crashes, errors, and anything that isn't working as expected.",
  },
  {
    Icon: IconLock,
    color: "sc-rose",
    title: "Account",
    desc: "Login issues, password resets, and account access problems.",
  },
  {
    Icon: IconChat,
    color: "sc-teal",
    title: "General",
    desc: "Anything that doesn't fit the categories above — we'll route it right.",
  },
  {
    Icon: IconBox,
    color: "sc-violet",
    title: "Other",
    desc: "One-off requests handled by whichever specialist is the best fit.",
  },
];

const WHY = [
  { Icon: IconSparkle, title: "AI-sorted", desc: "Your category and priority are suggested the moment you submit." },
  { Icon: IconUsers, title: "Real specialists", desc: "Every category has workers who only handle that kind of issue." },
  { Icon: IconClock, title: "No waiting in the dark", desc: "You're notified at every step, from booking to resolution." },
];

export default function Services({ onOpenAuth }) {
  const { user } = useAuth();
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const whyRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header and the category cards are visible the instant the page
      // loads, so they animate on mount — no ScrollTrigger needed, and
      // nothing to accidentally catch mid-flight on first paint.
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
      tl.from(headerRef.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        clearProps: "all",
      }).from(
        cardsRef.current.children,
        {
          opacity: 0,
          y: 70,
          duration: 0.7,
          stagger: 0.12,
          clearProps: "all",
        },
        "-=0.25"
      );

      // "Why it works" is below the fold, so it plays once when scrolled
      // into view.
      gsap.from(whyRef.current.children, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: whyRef.current,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page wide-page">
      <div className="dashboard-header" ref={headerRef}>
        <h1 className="wide-page-title">One category, one specialist</h1>
        <p>
          Every ticket is matched to a worker who handles exactly this kind of problem —
          no generalists, no guesswork.
        </p>
      </div>

      <div className="services-grid" ref={cardsRef}>
        {SERVICES.map((s) => (
          <div
            className={`service-card ${s.color}`}
            key={s.title}
            onMouseEnter={(e) =>
              gsap.to(e.currentTarget.querySelector(".service-card-icon"), {
                scale: 1.2,
                rotate: -8,
                duration: 0.25,
                ease: "back.out(2)",
              })
            }
            onMouseLeave={(e) =>
              gsap.to(e.currentTarget.querySelector(".service-card-icon"), {
                scale: 1,
                rotate: 0,
                duration: 0.3,
                ease: "power2.out",
              })
            }
          >
            <span className="service-card-icon"><s.Icon /></span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="section-title">Why it works</h2>
        <p>Matching a ticket to the right specialist is the whole point of RelaySupport.</p>
      </div>
      <div className="services-why-row" ref={whyRef}>
        {WHY.map((w) => (
          <div className="services-why-card" key={w.title}>
            <span className="services-why-icon"><w.Icon /></span>
            <div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {(!user || user.role === "customer") && (
        <div className="home-cta-banner">
          <h2>Not sure which category fits?</h2>
          <p>Submit your ticket and let RelaySupport's AI suggest one for you.</p>
          {user ? (
            <Link to="/tickets/new" className="btn-primary">Submit a Ticket →</Link>
          ) : (
            <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
              Get Started →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
