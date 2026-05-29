import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";

const AdminReportsPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">
            View <span className="text-secondary">Reports</span>
          </h1>
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Reports section coming soon</p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
