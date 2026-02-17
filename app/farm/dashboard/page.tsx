'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { CheckSquare, DollarSign, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/src/stores/app-store';

export default function FarmDashboardPage() {
  const { userRole, currentFarmId } = useAppStore();

  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: 'Tasks Today',
      value: '12',
      change: '+2 from yesterday',
      trend: 'up' as const,
      icon: CheckSquare,
    },
    {
      title: 'Budget Used',
      value: '₹45,231',
      change: '67% of monthly',
      trend: 'neutral' as const,
      icon: DollarSign,
    },
    {
      title: 'Inventory Alerts',
      value: '3',
      change: 'Items low stock',
      trend: 'down' as const,
      icon: Package,
    },
    {
      title: 'Open Incidents',
      value: '1',
      change: 'Needs attention',
      trend: 'neutral' as const,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening on your farm.
        </p>
      </div>

      {/* Role badge */}
      {userRole && (
        <Badge variant="outline" className="capitalize">
          Role: {userRole}
        </Badge>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                  <span>{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Create Task</Button>
          <Button variant="outline">Record Daily Update</Button>
          <Button variant="outline">Request Funds</Button>
          <Button variant="outline">Log Inventory Movement</Button>
        </CardContent>
      </Card>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your farm operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Task Completed: Irrigation Check</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Spend Request Approved</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Low Stock Alert: Fertilizer</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!currentFarmId && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-yellow-900 dark:text-yellow-200">
              No Farm Selected
            </CardTitle>
            <CardDescription className="text-yellow-800 dark:text-yellow-300">
              Please select a farm to view your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Select Farm</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
