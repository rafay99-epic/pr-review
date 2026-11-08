// The home page: hero with the exploded stack, then the story of a review.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Footer, Nav } from "./components/chrome.tsx";
import { Hero } from "./components/hero.tsx";
import { BotComment, Config, Layers, Problem, Providers, Rounds, Start } from "./components/story.tsx";
import { useReveal } from "./hooks.ts";
import "./styles.css";

function Home() {
  useReveal();
  return (
    <>
      <Nav current="home" />
      <main>
        <Hero />
        <Problem />
        <Layers />
        <BotComment />
        <Rounds />
        <Config />
        <Providers />
        <Start />
      </main>
      <Footer />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<StrictMode><Home /></StrictMode>);
