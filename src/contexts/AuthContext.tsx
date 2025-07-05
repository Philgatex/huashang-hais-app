"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/types";

// --- MOCK USER DATA FOR PROTOTYPE ---
const mockUsersData: User[] = [
  {
    id: "admin-001",
    name: "Alice Admin",
    email: "admin@hais.com",
    role: "Admin",
    isVerifiedByAdmin: true,
    employeeNumber: "ADM001",
    department: "Management",
    jobTitle: "System Administrator",
    avatar: "https://placehold.co/100x100.png?text=AA",
  },
  {
    id: "hr-001",
    name: "Bob HR",
    email: "hr@hais.com",
    role: "HR",
    isVerifiedByAdmin: true,
    employeeNumber: "HR001",
    department: "Human Resources",
    jobTitle: "HR Manager",
    avatar: "https://placehold.co/100x100.png?text=BH",
  },
  {
    id: "employee-001",
    name: "Charlie Employee",
    email: "employee@hais.com",
    role: "Employee",
    isVerifiedByAdmin: true,
    employeeNumber: "E001",
    department: "Sales",
    jobTitle: "Sales Executive",
    dateOfJoining: new Date("2022-08-15"),
    salary: { gross: 75000 },
    bioData: { kraPin: "A001234567X" },
    paymentDetails: {
      method: "Bank Transfer",
      bankName: "KCB Bank",
      accountNumber: "...1234",
    },
    avatar: "https://placehold.co/100x100.png?text=CE",
  },
  {
    id: "supervisor-001",
    name: "Diana Supervisor",
    email: "supervisor@hais.com",
    role: "Supervisor",
    isVerifiedByAdmin: true,
    employeeNumber: "SUP001",
    department: "Engineering",
    jobTitle: "Team Lead",
    managesEmployeeIds: ["E002", "E003"],
    avatar: "https://placehold.co/100x100.png?text=DS",
  },
  {
    id: "employee-002",
    name: "Edward Engineer",
    email: "engineer@hais.com",
    role: "Employee",
    isVerifiedByAdmin: true,
    employeeNumber: "E002",
    department: "Engineering",
    jobTitle: "Software Engineer",
    avatar: "https://placehold.co/100x100.png?text=EE",
  },
  {
    id: "employee-003",
    name: "Fiona Frontend",
    email: "frontend@hais.com",
    role: "Employee",
    isVerifiedByAdmin: true,
    employeeNumber: "E003",
    department: "Engineering",
    jobTitle: "Frontend Developer",
    avatar: "https://placehold.co/100x100.png?text=FF",
  },
  {
    id: "recruiter-001",
    name: "Grace Recruiter",
    email: "recruiter@hais.com",
    role: "Recruiter",
    isVerifiedByAdmin: true,
    employeeNumber: "REC001",
    department: "Human Resources",
    jobTitle: "Talent Acquisition Specialist",
    avatar: "https://placehold.co/100x100.png?text=GR",
  },
  {
    id: "payroll-partner-001",
    name: "Henry Partner",
    email: "partner@hais.com",
    role: "Payroll Partner",
    isVerifiedByAdmin: true,
    employeeNumber: "PP001",
    department: "External",
    jobTitle: "Payroll Consultant",
    avatar: "https://placehold.co/100x100.png?text=HP",
  },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password?: string,
    role?: UserRole
  ) => Promise<void>;
  logout: () => void;
  mockUsersData: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("hais-mock-user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.dateOfJoining) {
          parsed.dateOfJoining = new Date(parsed.dateOfJoining);
        }
        setUser(parsed);
      }
    } catch (error) {
      console.error("Invalid stored user in localStorage", error);
      localStorage.removeItem("hais-mock-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const foundUser = mockUsersData.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("hais-mock-user", JSON.stringify(foundUser));
    } else {
      throw new Error("Invalid email or password.");
    }
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    role: UserRole = "Employee"
  ) => {
    console.log("Mock register user:", { name, email, role });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hais-mock-user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        mockUsersData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
