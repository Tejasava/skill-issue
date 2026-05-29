import { motion } from "framer-motion";
import { ArrowRightLeft, Trophy, Users, ShoppingBag, MessageSquare, Briefcase } from "lucide-react";

const features = [
  {
    icon: ArrowRightLeft,
    title: "Skill Exchange",
    description: "Barter your skills with others. Trade React for Python, design for backend — your knowledge is currency.",
    color: "from-neon-blue to-neon-purple",
  },
  {
    icon: Trophy,
    title: "Talent Hunt",
    description: "Compete in coding challenges, solve real problems, and win bounties. Prove your skills on stage.",
    color: "from-neon-purple to-neon-cyan",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join or create communities around technologies. Share posts, code snippets, and collaborate.",
    color: "from-neon-cyan to-neon-blue",
  },
  {
    icon: ShoppingBag,
    title: "Project Marketplace",
    description: "Buy and sell developer projects. Find ready-made solutions or monetize your side projects.",
    color: "from-neon-blue to-neon-cyan",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Connect instantly with peers. Share code, discuss projects, and build relationships.",
    color: "from-neon-purple to-neon-blue",
  },
  {
    icon: Briefcase,
    title: "Portfolio Showcase",
    description: "Display your work, achievements, and skills. Let your profile speak louder than your resume.",
    color: "from-neon-cyan to-neon-purple",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Level Up</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete ecosystem for developers to learn, collaborate, and grow together.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={(Math.random() * 0.3)}
              className="glass rounded-2xl p-6 card-hover group cursor-pointer relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))`,
                }}
              />
              
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="relative z-10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
