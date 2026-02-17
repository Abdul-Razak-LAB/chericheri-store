// User roles
export type UserRole = 'owner' | 'manager' | 'worker' | 'vendor' | 'verifier';

// API Response envelope
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Farm
export interface Farm {
  id: string;
  name: string;
  location: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmIds: string[];
  currentFarmId?: string;
  imageUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Task
export interface Task {
  id: string;
  farmId: string;
  title: string;
  description?: string;
  templateId?: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  proofOfWork?: ProofOfWork;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ProofOfWork {
  photos?: MediaAttachment[];
  videos?: MediaAttachment[];
  audio?: MediaAttachment[];
  notes?: string;
  gps?: GpsCoordinates;
  timestamp: string;
}

export interface MediaAttachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  metadata?: MediaMetadata;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  gps?: GpsCoordinates;
  timestamp: string;
}

export interface GpsCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

// Task Template
export interface TaskTemplate {
  id: string;
  farmId: string;
  name: string;
  description?: string;
  defaultAssignee?: string;
  defaultDuration: number; // in hours
  requiresProof: boolean;
  proofRequirements?: {
    minPhotos?: number;
    minVideos?: number;
    requireGps?: boolean;
    requireNotes?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Budget & Spend
export interface Budget {
  id: string;
  farmId: string;
  name: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  pending: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpendRequest {
  id: string;
  farmId: string;
  requestedBy: string;
  budgetId: string;
  category: string;
  amount: number;
  description: string;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Procurement
export interface PurchaseRequest {
  id: string;
  farmId: string;
  requestedBy: string;
  items: PurchaseRequestItem[];
  totalAmount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'po_created';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: string;
}

export interface PurchaseOrder {
  id: string;
  farmId: string;
  purchaseRequestId: string;
  vendorId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'acknowledged' | 'fulfilled' | 'cancelled';
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
}

export interface Delivery {
  id: string;
  farmId: string;
  purchaseOrderId: string;
  receivedBy: string;
  receivedAt: string;
  items: DeliveryItem[];
  discrepancies?: Discrepancy[];
  status: 'partial' | 'complete' | 'with_issues';
  notes?: string;
  proofOfDelivery?: MediaAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryItem {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  expectedQuantity: number;
  condition: 'good' | 'damaged' | 'missing';
  lotNumber?: string;
  expiryDate?: string;
}

export interface Discrepancy {
  id: string;
  type: 'quantity' | 'quality' | 'missing_item' | 'wrong_item';
  description: string;
  itemId: string;
  expectedQuantity?: number;
  actualQuantity?: number;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  photos?: MediaAttachment[];
}

// Inventory
export interface InventoryItem {
  id: string;
  farmId: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  location: string;
  isLeakageItem: boolean;
  lots?: InventoryLot[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLot {
  id: string;
  lotNumber: string;
  quantity: number;
  receivedDate: string;
  expiryDate?: string;
  status: 'available' | 'reserved' | 'expired';
}

export interface InventoryMovement {
  id: string;
  farmId: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  lotNumber?: string;
  reason: string;
  performedBy: string;
  approvedBy?: string;
  referenceType?: 'purchase_order' | 'task' | 'manual';
  referenceId?: string;
  timestamp: string;
  notes?: string;
}

// Payroll
export interface PayrollRun {
  id: string;
  farmId: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed';
  totalAmount: number;
  employeePayments: EmployeePayment[];
  preparedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayment {
  userId: string;
  userName: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

// Verification & Audit
export interface AuditSchedule {
  id: string;
  farmId: string;
  type: 'inventory' | 'financial' | 'process' | 'compliance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  assignedTo: string;
  nextDueDate: string;
  checklist: AuditChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditChecklistItem {
  id: string;
  description: string;
  requiresProof: boolean;
  category: string;
  order: number;
}

export interface AuditExecution {
  id: string;
  farmId: string;
  scheduleId: string;
  executedBy: string;
  executedAt: string;
  status: 'in_progress' | 'completed' | 'incomplete';
  results: AuditResult[];
  overallCompliance: number; // percentage
  discrepancies?: AuditDiscrepancy[];
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditResult {
  checklistItemId: string;
  passed: boolean;
  notes?: string;
  proof?: MediaAttachment[];
  timestamp: string;
}

export interface AuditDiscrepancy {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendedAction?: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

// Monitoring & Sensors
export interface Sensor {
  id: string;
  farmId: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'ph' | 'light' | 'custom';
  location: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
  status: 'active' | 'inactive' | 'malfunction';
  lastReading?: SensorReading;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  timestamp: string;
  isAlert: boolean;
  alertType?: 'below_min' | 'above_max';
}

export interface MonitoringAlert {
  id: string;
  farmId: string;
  sensorId: string;
  type: 'threshold_breach' | 'sensor_offline' | 'data_anomaly';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

// Incidents
export interface Incident {
  id: string;
  farmId: string;
  title: string;
  description: string;
  category: 'equipment' | 'crop' | 'livestock' | 'safety' | 'weather' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  expertRequested?: boolean;
  expertType?: string;
  resolution?: string;
  timeline: IncidentTimelineEntry[];
  attachments?: MediaAttachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IncidentTimelineEntry {
  id: string;
  type: 'reported' | 'updated' | 'escalated' | 'expert_assigned' | 'resolved';
  description: string;
  performedBy: string;
  timestamp: string;
  attachments?: MediaAttachment[];
}

// Communications
export interface DailyUpdate {
  id: string;
  farmId: string;
  managerId: string;
  date: string;
  audioUrl?: string;
  transcription?: string;
  textNotes?: string;
  highlights?: string[];
  issues?: string[];
  tasksCompleted: number;
  tasksPending: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyDigest {
  id: string;
  farmId: string;
  weekStartDate: string;
  weekEndDate: string;
  overview: {
    tasksCompleted: number;
    tasksPending: number;
    budgetUtilization: number;
    inventoryAlerts: number;
    incidents: number;
  };
  highlights: string[];
  concerns: string[];
  trends: TrendCard[];
  pendingApprovals: number;
  generatedAt: string;
}

export interface TrendCard {
  metric: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
  context: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  farmId: string;
  type: 'task' | 'approval' | 'alert' | 'update' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

// Web Push
export interface PushSubscription {
  userId: string;
  farmId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: string;
}
