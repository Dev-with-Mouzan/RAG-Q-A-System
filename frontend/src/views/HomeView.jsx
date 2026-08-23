import Hero from "../sections/Hero";
import TechStrip from "../sections/TechStrip";
import Problem from "../sections/Problem";
import Platform from "../sections/Platform";
import Security from "../sections/Security";
import UseCases from "../sections/UseCases";
import About from "../sections/About";
import Cta from "../sections/Cta";

export default function HomeView({ navigate }) {
  return (
    <main className="home-main">
      <Hero navigate={navigate} />
      <TechStrip />
      <Problem />
      <Platform />
      <Security />
      <UseCases navigate={navigate} />
      <About />
      <Cta navigate={navigate} />
    </main>
  );
}
