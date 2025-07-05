"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

interface ApprovalItem {
  id: string;
  type: 'Leave Request' | 'Payroll Batch' | 'Expense Claim';
  submittedBy: string;
  dateSubmitted: Date;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockApprovals: ApprovalItem[] = [
  { id: 'A001', type: 'Leave Request', submittedBy: 'Alice Wonderland (E001)', dateSubmitted: new Date(2024, 6, 15), details: 'Annual Leave: Aug 1 - Aug 5', status: 'Pending' },
  { id: 'A002', type: 'Payroll Batch', submittedBy: 'Bob HR (HR001)', dateSubmitted: new Date(2024, 6, 28), details: 'June 2024 Salaried Payroll', status: 'Pending' },
  { id: 'A003', type: 'Expense Claim', submittedBy: 'Charlie Employee (E003)', dateSubmitted: new Date(2024, 6, 20), details: 'Travel Expenses - KES 5,000', status: 'Approved' },
  { id: 'A004', type: 'Leave Request', submittedBy: 'David Manager (M002)', dateSubmitted: new Date(2024, 6, 10), details: 'Sick Leave: July 10', status: 'Rejected' },
];

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  if (!user || (user.role !== 'Admin' && user.role !== 'HR' && user.role !== 'Supervisor')) {
    return (
      <Card>
        <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
        <CardContent><p>You do not have permission to view this page.</p></CardContent>
      </Card>
    );
  }
  
  const handleApprovalAction = (id: string, action: 'Approved' | 'Rejected') => {
    setApprovals(prev => prev.map(item => item.id === id ? {...item, status: action} : item));
    toast({ title: "Action Taken", description: `Item ${id} has been ${action.toLowerCase()}.` });
  };
  
  const displayedItems = activeTab === 'pending'
    ? approvals.filter(item => {
        if (user.role === 'Supervisor') {
          // A supervisor can only approve requests from their direct reports (mock logic)
          const employeeId = item.submittedBy.match(/\(([^)]+)\)/)?.[1];
          return item.status === 'Pending' && user.managesEmployeeIds?.includes(employeeId || '');
        }
        return item.status === 'Pending';
      })
    : approvals.filter(item => item.status !== 'Pending');


  const getStatusBadgeVariant = (status: ApprovalItem['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Approval Center</CardTitle>
          <CardDescription>Manage pending approvals and view approval history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
              <TabsTrigger value="history">Approval History</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {displayedItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{item.dateSubmitted.toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-sm truncate">{item.details}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleApprovalAction(item.id, 'Approved')}>
                               <Icons.Applicants className="mr-1 h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleApprovalAction(item.id, 'Rejected')}>
                               <Icons.CloseIcon className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.Applicants className="mx-auto h-12 w-12" />
                  <p className="mt-2">No pending approvals.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              {displayedItems.length > 0 ? (
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{item.dateSubmitted.toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-sm truncate">{item.details}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.Reports className="mx-auto h-12 w-12" />
                  <p className="mt-2">No approval history found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
