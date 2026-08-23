import ArrowButton from "../components/ArrowButton";
import Eyebrow from "../components/Eyebrow";
import SplitText from "../components/SplitText";
import { motion } from "framer-motion";

export default function Cta({ navigate }) {
  return (
    <section className="section cta-sec">
      <div className="container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
        >
          <div className="cta-orb orb-a" aria-hidden="true" />
          <div className="cta-orb orb-b" aria-hidden="true" />
          <Eyebrow dark>Get Started</Eyebrow>
          <h2 className="sec-title light cta-title">
            <SplitText text="Ready to talk to" />
            <br />
            <SplitText text="your documents?" className="accent" as="span" />
          </h2>
          <p className="cta-sub">
            Upload a PDF or fire your first research query — no account required.
          </p>
          <ArrowButton white onClick={() => navigate("pdf")}>Launch LiteraAI</ArrowButton>
        </motion.div>
      </div>
    </section>
  );
}
