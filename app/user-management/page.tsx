
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { User, UserRole } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch'; 

const USER_ROLES: UserRole[] = ["Admin", "HR", "Employee", "Recruiter", "Payroll Partner", "Supervisor"];

const initialNewUserState: Partial<User> = {
  name: '',
  email: '',
  role: 'Employee',
  employeeNumber: '',
  department: '',
  jobTitle: '',
  isVerifiedByAdmin: true, // Default to verified for prototype
};

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
  onSave: (user: Partial<User>) => Promise<void>;
}

function UserDialog({ isOpen, onOpenChange, userToEdit, onSave }: UserDialogProps) {
  const [userData, setUserData] = useState<Partial<User>>(initialNewUserState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUserData({
        ...userToEdit,
        dateOfJoining: userToEdit.dateOfJoining ? new Date(userToEdit.dateOfJoining) : undefined,
      });
    } else {
      setUserData(initialNewUserState);
    }
  }, [userToEdit, isOpen]);

  const handleInputChange = (field: keyof User, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedChange = (field: keyof User, nestedField: string, value: any) => {
    setUserData(prev => ({
        ...prev,
        [field]: {
            ...(prev[field] as object || {}),
            [nestedField]: value
        }
    }));
  };
  
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(userData);
      onOpenChange(false);
    } catch (error) {
      // Error toast is handled by onSave
    } finally {
      setIsSaving(false);
    }
  };

  const dateOfJoiningValue = useMemo(() => {
    if (!userData.dateOfJoining) return '';
    try {
        const date = new Date(userData.dateOfJoining);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
  }, [userData.dateOfJoining]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-3">
        <div className="grid gap-4 py-4">
          <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={userData.name || ''} onChange={e => handleInputChange('name', e.target.value)} /></div>
          <div><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" value={userData.email || ''} onChange={e => handleInputChange('email', e.target.value)} /></div>
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={userData.role} onValueChange={val => handleInputChange('role', val as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{USER_ROLES.map(role => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="employeeNumber">Employee Number</Label><Input id="employeeNumber" value={userData.employeeNumber || ''} onChange={e => handleInputChange('employeeNumber', e.target.value)} /></div>
          <div><Label htmlFor="department">Department</Label><Input id="department" value={userData.department || ''} onChange={e => handleInputChange('department', e.target.value)} /></div>
          <div><Label htmlFor="jobTitle">Job Title</Label><Input id="jobTitle" value={userData.jobTitle || ''} onChange={e => handleInputChange('jobTitle', e.target.value)} /></div>
           <div>
            <Label htmlFor="dateOfJoining">Date of Joining</Label>
            <Input 
                type="date" 
                id="dateOfJoining" 
                value={dateOfJoiningValue}
                onChange={e => handleInputChange('dateOfJoining', e.target.valueAsDate || undefined)} 
            />
          </div>
          <div>
            <Label htmlFor="category">Category (e.g., Permanent, Contract)</Label>
            <Input id="category" value={userData.category || ''} onChange={e => handleInputChange('category', e.target.value)} />
          </div>
          <h4 className="text-md font-semibold pt-2 border-t mt-2">Contact Details</h4>
          <div><Label htmlFor="contactPhone">Phone</Label><Input id="contactPhone" value={userData.contact?.phone || ''} onChange={e => handleNestedChange('contact', 'phone', e.target.value)} /></div>
          <div><Label htmlFor="contactAddress">Address</Label><Input id="contactAddress" value={userData.contact?.address || ''} onChange={e => handleNestedChange('contact', 'address', e.target.value)} /></div>
          <h4 className="text-md font-semibold pt-2 border-t mt-2">Bio Data</h4>
          <div><Label htmlFor="nationalId">National ID</Label><Input id="nationalId" value={userData.bioData?.nationalId || ''} onChange={e => handleNestedChange('bioData', 'nationalId', e.target.value)} /></div>
          <div><Label htmlFor="kraPin">KRA PIN</Label><Input id="kraPin" value={userData.bioData?.kraPin || ''} onChange={e => handleNestedChange('bioData', 'kraPin', e.target.value)} /></div>
           <div className="flex items-center space-x-2 pt-3 border-t mt-2">
            <Switch
              id="isVerifiedByAdmin"
              checked={userData.isVerifiedByAdmin || false}
              onCheckedChange={(checked) => handleInputChange('isVerifiedByAdmin', checked)}
            />
            <Label htmlFor="isVerifiedByAdmin">Account Verified by Admin</Label>
          </div>
        </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Icons.Settings className="animate-spin mr-2" /> : null}
            {userToEdit ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManagementPage() {
  const { user, mockUsersData } = useAuth(); // 'user' is the logged-in user
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsersData);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');

  const handleAddNew = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!userData.name || !userData.email || !userData.role) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Name, email, and role are required." });
        throw new Error("Missing required fields");
    }

    // Simulate saving to a "database" (local state)
    if (editingUser) {
      setUsers(prevUsers => prevUsers.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
      toast({ title: "User Updated", description: `${userData.name} has been updated successfully.` });
    } else {
      const newUser: User = {
        id: `USR${Date.now()}`,
        ...initialNewUserState,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      setUsers(prevUsers => [newUser, ...prevUsers]);
      toast({ title: "User Added", description: `${userData.name} has been added successfully.` });
    }
  };

  const handleDeleteUser = async (userId: string, userName?: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName || 'this user'}? This action cannot be undone.`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast({ title: "User Deleted", description: `${userName || 'User'} has been deleted successfully.` });
    }
  };
  
  const filteredUsers = users.filter(u => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = searchTerm === '' || 
                              (u.name && u.name.toLowerCase().includes(searchTermLower)) ||
                              (u.email && u.email.toLowerCase().includes(searchTermLower)) ||
                              (u.employeeNumber && u.employeeNumber.toLowerCase().includes(searchTermLower));
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearchTerm && matchesRole;
  });

  if (!user || (user.role !== 'Admin' && user.role !== 'HR' && user.role !== 'Payroll Partner')) {
    return (
      <Card>
        <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
        <CardContent><p>You do not have permission to manage users.</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Employee Database</CardTitle>
              <CardDescription>Manage employee records and profiles.</CardDescription>
            </div>
            <Button onClick={handleAddNew}><Icons.PlusCircle className="mr-2 h-4 w-4" /> Add New Employee</Button>
          </div>
           <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Search by name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterRole} onValueChange={(value) => setFilterRole(value as UserRole | 'All')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {USER_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Icons.Settings className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <Icons.Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No employees found matching filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Employee #</TableHead><TableHead>Role</TableHead>
                    <TableHead>Department</TableHead><TableHead>Job Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                      <TableCell>{u.employeeNumber || 'N/A'}</TableCell>
                      <TableCell><Badge variant={u.role === 'Admin' ? 'default' : u.role === 'HR' ? 'secondary' : 'outline'}>{u.role}</Badge></TableCell>
                      <TableCell>{u.department || 'N/A'}</TableCell>
                      <TableCell>{u.jobTitle || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={u.isVerifiedByAdmin ? 'secondary' : 'destructive'}>
                          {u.isVerifiedByAdmin ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id, u.name)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                Total users matching filters: {filteredUsers.length}
            </p>
         </CardFooter>
      </Card>

      <UserDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        userToEdit={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
