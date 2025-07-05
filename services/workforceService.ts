// src/lib/services/workforceService.ts
// THIS FILE IS INTENTIONALLY MODIFIED FOR PROTOTYPE/DEMO MODE.
// It uses mock data and simulates database interactions.

import type { Skill, MockRole, User } from '@/types';

// Mock data for roles - in a real app, this would be a separate collection in Firestore
const mockRolesData: MockRole[] = [
  { id: 'role_dev_sr', name: 'Senior Software Engineer', requiredSkills: [{ name: 'TypeScript', level: 'Advanced' }, { name: 'React', level: 'Expert' }, { name: 'Node.js', level: 'Advanced' }, { name: 'System Design', level: 'Intermediate' }] },
  { id: 'role_hr_mgr', name: 'HR Manager', requiredSkills: [{ name: 'Recruitment', level: 'Expert' }, { name: 'Employee Relations', level: 'Expert' }, { name: 'Payroll Management', level: 'Advanced' }, { name: 'HRIS Systems', level: 'Intermediate' }] },
  { id: 'role_pm', name: 'Project Manager', requiredSkills: [{ name: 'Agile Methodology', level: 'Expert' }, { name: 'Risk Management', level: 'Advanced' }, { name: 'Stakeholder Communication', level: 'Expert' }] },
];

// --- Mock User Data (subset of what's in AuthContext for consistency) ---
let mockUsersData: User[] = [
  { id: 'employee-001', name: 'Charlie Employee', email: 'employee@hais.com', role: 'Employee', employeeNumber: 'E001', department: 'Sales', skills: [{name: 'Salesforce', level: 'Intermediate'}, {name: 'Negotiation', level: 'Advanced'}]},
  { id: 'supervisor-001', name: 'Diana Supervisor', email: 'supervisor@hais.com', role: 'Supervisor', employeeNumber: 'SUP001', department: 'Engineering', skills: [{name: 'React', level: 'Advanced'}, {name: 'Project Management', level: 'Expert'}]},
  { id: 'employee-002', name: 'Edward Engineer', email: 'engineer@hais.com', role: 'Employee', employeeNumber: 'E002', department: 'Engineering', skills: [{name: 'React', level: 'Intermediate'}, {name: 'Node.js', level: 'Beginner'}]},
];


// Helper function to get employee skills from the mock data
export const getEmployeeSkills = async (employeeId: string): Promise<Skill[]> => {
    if (!employeeId) return [];
    // Simulate network delay
    await new Promise(res => setTimeout(res, 200));
    const user = mockUsersData.find(u => u.id === employeeId);
    return user?.skills || [];
};

// 1. Store/Update Employee Skill Profile in the mock data
export const addEmployeeSkillProfile = async (employeeId: string, skills: Skill[]): Promise<void> => {
  if (!employeeId) {
    throw new Error("Employee ID is required to add/update a skill profile.");
  }
  // Simulate network delay
  await new Promise(res => setTimeout(res, 300));
  mockUsersData = mockUsersData.map(user => {
    if (user.id === employeeId) {
      return { ...user, skills: skills };
    }
    return user;
  });
};

// 2. Perform Skills Gap Analysis
export const getSkillsGap = async (employeeId: string, roleId: string): Promise<Skill[]> => {
  if (!employeeId || !roleId) {
    throw new Error("Employee ID and Role ID are required for skill gap analysis.");
  }
   // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const targetRole = mockRolesData.find(r => r.id === roleId);
  if (!targetRole) {
    throw new Error("Target role not found.");
  }

  const employeeSkills = await getEmployeeSkills(employeeId);
  const employeeSkillMap = new Map(employeeSkills.map(s => [s.name.toLowerCase(), s.level]));
  const levelValues: Record<Skill['level'], number> = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };

  const gap: Skill[] = targetRole.requiredSkills.filter(requiredSkill => {
    const employeeSkillLevel = employeeSkillMap.get(requiredSkill.name.toLowerCase());
    if (!employeeSkillLevel) {
      return true; // Skill is missing
    }
    return levelValues[requiredSkill.level] > (levelValues[employeeSkillLevel] || 0);
  });
  
  return gap;
};

// 3. Headcount Forecasting
export const getHeadcountForecast = async (departmentName: string): Promise<{ current: number; forecasted: number; }> => {
   // Simulate network delay
  await new Promise(res => setTimeout(res, 400));
  
  let usersInDept = mockUsersData;
  if (departmentName && departmentName !== 'all') {
    usersInDept = mockUsersData.filter(u => u.department === departmentName);
  }
  
  const currentCount = usersInDept.length;
  // Mock logic: +10% projected growth for next year
  const forecasted = Math.ceil(currentCount * 1.10);

  return { current: currentCount, forecasted };
};

// 4. Scenario Modeling (Local Logic)
export const simulateScenario = (currentCount: number, scenarioId: string): number => {
  const scenarioGrowthMap: Record<string, number> = {
    'new_product_launch': 1.15, // +15%
    'market_expansion': 1.20, // +20%
    'restructuring_downsize': 0.90, // -10%
    'strategic_hiring_freeze': 1.00, // No change
  };
  
  const factor = scenarioGrowthMap[scenarioId];
  if (factor === undefined) {
      throw new Error("Invalid scenario type.");
  }

  const result = factor < 1 ? Math.floor(currentCount * factor) : Math.ceil(currentCount * factor);
  return result;
};
