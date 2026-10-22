import DashboardLayout from '../components/DashboardLayout';
import { adminNavItems } from '../config/navigation';

export default function Dashboard() {
  return <DashboardLayout menuItems={adminNavItems}>{null}</DashboardLayout>;
}
