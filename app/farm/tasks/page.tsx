'use client';

import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { useAppStore } from '@/src/stores/app-store';
import { useTaskWorkflowStore } from '@/src/stores/task-workflow-store';
import { useTasks } from '@/src/lib/hooks/use-tasks';
import { formatRelativeTime } from '@/src/lib/utils';

export default function TasksPage() {
  const { currentFarmId, isOnline } = useAppStore();
  const { statusFilter, setStatusFilter } = useTaskWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tasks based on filter
  const { data: tasks, isLoading } = useTasks(
    statusFilter === 'all' ? undefined : statusFilter
  );

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const tasksByStatus = {
    today: filteredTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString() && t.status !== 'completed';
    }),
    overdue: filteredTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'completed';
    }),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track farm operations tasks
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b">
        {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {!currentFarmId && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-yellow-900 dark:text-yellow-200">
              No Farm Selected
            </CardTitle>
            <CardDescription className="text-yellow-800 dark:text-yellow-300">
              Please select a farm to view tasks
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      )}

      {/* Task Sections */}
      {!isLoading && currentFarmId && (
        <div className="space-y-6">
          {/* Today's Tasks */}
          {(statusFilter === 'all' || statusFilter === 'pending') && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Today ({tasksByStatus.today.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasksByStatus.today.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No tasks due today
                    </CardContent>
                  </Card>
                ) : (
                  tasksByStatus.today.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Overdue Tasks */}
          {(statusFilter === 'all' || statusFilter === 'overdue') && tasksByStatus.overdue.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-destructive">
                Overdue ({tasksByStatus.overdue.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasksByStatus.overdue.map((task) => (
                  <TaskCard key={task.id} task={task} isOverdue />
                ))}
              </div>
            </section>
          )}

          {/* Completed Tasks */}
          {(statusFilter === 'all' || statusFilter === 'completed') && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Completed ({tasksByStatus.completed.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasksByStatus.completed.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No completed tasks
                    </CardContent>
                  </Card>
                ) : (
                  tasksByStatus.completed.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {!isOnline && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="py-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Offline Mode:</strong> You can still create and complete tasks. 
              Changes will sync automatically when you're back online.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskCard({ task, isOverdue = false }: { task: any; isOverdue?: boolean }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  };

  return (
    <Card className={isOverdue ? 'border-destructive' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge
            variant="outline"
            className={priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}
          >
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <CardDescription className="line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {task.status.replace('_', ' ')}
          </Badge>
          <span className="text-muted-foreground">
            {formatRelativeTime(task.dueDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
