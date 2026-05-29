import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Chen",
    role: "Full Stack Developer",
    text: "Skill Issue changed how I learn. I traded my React expertise for Python ML skills — zero cost, maximum value.",
    avatar: "AC",
  },
  {
    name: "Priya Sharma",
    role: "UI/UX Designer",
    text: "Found amazing developers to collaborate with. The community here is genuinely supportive and talented.",
    avatar: "PS",
  },
  {
    name: "Jordan Davis",
    role: "Backend Engineer",
    text: "Won my first bounty in Talent Hunt and got connected with three amazing devs. This platform is gold.",
    avatar: "JD",
  },
];

const shimmerVariants = {
  initial: { backgroundPosition: "200% center" },
  animate: {
    backgroundPosition: ["-200% center", "200% center"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Developers</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 card-hover relative overflow-hidden group"
            >
              {/* Shimmer effect background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                variants={shimmerVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              />
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className="flex gap-1 mb-4 relative z-10"
              >
                {[...Array(5)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + j * 0.05 }}
                  >
                    <Star className="w-4 h-4 fill-accent text-accent" />
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-6 relative z-10">"{t.text}"</p>
              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.3 }}
                >
                  {t.avatar}
                </motion.div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
