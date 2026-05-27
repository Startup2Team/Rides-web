"use client";

import { useEffect, useState } from "react";

function computeGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Working late";
}

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const update = () => setGreeting(computeGreeting(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
      {greeting}, {name} 👋
    </h1>
  );
}

export function DateSubtitle() {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  return (
    <p className="mt-1.5 text-sm text-muted-foreground">
      {text || "Here's what's happening on the platform today."}
    </p>
  );
}
