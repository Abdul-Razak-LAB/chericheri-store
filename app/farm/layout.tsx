import { FarmLayout } from '@/src/components/farm/layout';

export default function FarmDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FarmLayout>{children}</FarmLayout>;
}
