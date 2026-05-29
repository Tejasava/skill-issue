import { motion } from "framer-motion";
import { UserPlus, Search, Handshake, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Sign Up", description: "Create your profile and list your skills.", number: "01" },
  { icon: Search, title: "Find Matches", description: "Discover people who want what you know.", number: "02" },
  { icon: Handshake, title: "Exchange", description: "Barter, teach, or collaborate on projects.", number: "03" },
  { icon: Rocket, title: "Grow", description: "Level up your skills and build your network.", number: "04" },
];

const pulseVariants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const rotateVariants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            How It <span className="gradient-text-accent">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">Four simple steps to start exchanging skills.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center group"
            >
              <motion.div
                className="text-6xl font-display font-bold text-muted/30 mb-4 group-hover:text-muted/50 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                {step.number}
              </motion.div>
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="w-14 h-14 rounded-2xl glass mx-auto mb-4 flex items-center justify-center neon-glow-blue group-hover:scale-110 transition-transform relative"
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-primary/20"
                  variants={rotateVariants}
                  initial="initial"
                  animate="animate"
                />
                <step.icon className="w-7 h-7 text-primary relative z-10" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
              
              {/* Connection line to next step */}
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-1/3 -right-8 w-8 h-1 bg-gradient-to-r from-primary to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
