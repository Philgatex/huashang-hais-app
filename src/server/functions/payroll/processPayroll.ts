
// src/server/functions/payroll/processPayroll.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // Required for admin.firestore.FieldValue
import { adminDb, adminAuth } from '../utils/firebaseAdmin';
import { payrollRates, RateTier } from '@/config/payrollRates'; // Assuming path to your rates config
import type { User, PayslipData, PayrollAudit, CustomDeduction, SalaryDetails, PaymentDetails } from '@/types'; // Adjust path as needed

interface PayrollRunRequestData {
  employeeIds: string[]; // Array of employee UIDs (or employeeNumbers if they are unique doc IDs)
  period: string; // e.g., "June 2024"
  // Include any manual adjustments passed from frontend per employee if needed
  // For simplicity, we'll assume adjustments are part of the employee document for this run
  // or fetched dynamically.
  clientId?: string; // For Payroll Partner context
}

/**
 * HTTP-triggered Firebase Function to process payroll.
 * This is a placeholder for a complex process.
 * A real implementation would involve:
 * - Reading detailed employee data (salary, contract, payment details, custom deductions).
 * - Fetching time & attendance data (if integrated).
 * - Fetching approved expense claims.
 * - Performing accurate statutory calculations based on current KRA/NSSF/NHIF/AHL rules
 *   (ideally fetched from a dynamic `/payrollSettings` collection or using defaults).
 * - Generating detailed payslip documents.
 * - Potentially integrating with payment disbursement APIs (M-Pesa, Banks).
 * - Robust error handling and logging.
 * - For long-running tasks, consider background functions or task queues.
 */
export const processPayroll = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // TODO: Add authentication and authorization checks
  // Example: Verify ID token from request, check user role (Admin, HR, Payroll Partner)
  // const idToken = req.headers.authorization?.split('Bearer ')[1];
  // if (!idToken) {
  //   res.status(401).send('Unauthorized');
  //   return;
  // }
  // try {
  //   const decodedToken = await adminAuth.verifyIdToken(idToken);
  //   const userRole = decodedToken.role as UserRole; // Assuming role is in custom claims
  //   if (!['Admin', 'HR', 'Payroll Partner'].includes(userRole)) {
  //     res.status(403).send('Forbidden');
  //     return;
  //   }
  // } catch (error) {
  //   console.error('Error verifying ID token:', error);
  //   res.status(401).send('Unauthorized');
  //   return;
  // }


  const { employeeIds, period, clientId } = req.body as PayrollRunRequestData;

  if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0 || !period) {
    res.status(400).json({ error: 'Missing required fields: employeeIds (array) and period.' });
    return;
  }

  console.log(`Starting payroll processing for period: ${period}, Client: ${clientId || 'General Org'}, Employees: ${employeeIds.length}`);

  const payslipsBatch = adminDb.batch();
  const payslipDocsData: PayslipData[] = [];
  let totalNetPayForAudit = 0;
  let totalDeductionsForAudit = 0;

  try {
    for (const employeeId of employeeIds) {
      const employeeDocRef = adminDb.collection('users').doc(employeeId); // Assuming employeeId is Firestore doc ID
      const employeeSnap = await employeeDocRef.get();

      if (!employeeSnap.exists) {
        console.warn(`Employee with ID ${employeeId} not found. Skipping.`);
        continue;
      }
      const employeeData = employeeSnap.data() as User;

      // --- Mock/Simplified Payroll Calculation ---
      // In a real app, this section would be extremely detailed.
      const grossSalary = employeeData.salary?.gross || 0;
      const allowances = employeeData.salary?.allowances;
      const housingAllowance = allowances?.housing || 0;
      const transportAllowance = allowances?.transport || 0;
      const otherAllowances = allowances?.other || 0;
      
      const totalAllowances = housingAllowance + transportAllowance + otherAllowances;
      const taxableIncome = grossSalary + totalAllowances; // Highly simplified for PAYE base

      // PAYE (Highly Simplified Mock)
      let paye = 0;
      if (taxableIncome > 24000) paye = (taxableIncome - 24000) * 0.10; // Very basic mock
      if (taxableIncome > 32333) paye += (taxableIncome - 32333) * 0.15; // Further mock tier

      // NSSF (Using fixed defaults from config for illustration)
      const nssfEmployee = payrollRates.NSSF.employee;
      const nssfEmployer = payrollRates.NSSF.employer;

      // SHIF (Using percentage from config)
      const shif = (grossSalary + totalAllowances) * payrollRates.SHIF.rate;

      // AHL (Using percentage from config)
      const ahlEmployee = (grossSalary + totalAllowances) * payrollRates.AHL.employee;
      const ahlEmployer = (grossSalary + totalAllowances) * payrollRates.AHL.employer;

      // NHIF (Old - simplified: pick a mid-tier amount for mock)
      const nhif = payrollRates.NHIF.find(tier => taxableIncome >= tier.min && taxableIncome <= tier.max)?.amount || 750;

      // HELB (Assuming it's in customDeductions or a specific field if globally managed)
      const helbDeductionObj = (employeeData.customDeductions || []).find(d => d.name.toLowerCase().includes('helb'));
      const helb = helbDeductionObj ? helbDeductionObj.amount : 0;

      const customDeductionsTotal = (employeeData.customDeductions || []).filter(d => !d.name.toLowerCase().includes('helb')).reduce((sum, d) => sum + d.amount, 0);

      const totalEmpStatutoryDeductions = paye + nssfEmployee + shif + ahlEmployee + nhif + helb;
      const netPay = taxableIncome - totalEmpStatutoryDeductions - customDeductionsTotal;

      totalNetPayForAudit += netPay;
      totalDeductionsForAudit += totalEmpStatutoryDeductions + customDeductionsTotal;

      const payslipId = adminDb.collection('payslips').doc().id; // Generate new ID
      const payslipDocRef = adminDb.collection('payslips').doc(payslipId);

      const payslipData: PayslipData = {
        id: payslipId,
        employeeId: employeeData.id, // Should be Firestore UID
        employeeNumber: employeeData.employeeNumber,
        employeeName: employeeData.name,
        period,
        grossSalary,
        allowances: { housing: housingAllowance, transport: transportAllowance, other: otherAllowances },
        deductions: {
          paye,
          nssf: { employee: nssfEmployee, employer: nssfEmployer },
          shif,
          ahl: { employee: ahlEmployee, employer: ahlEmployer },
          nita: { employer: payrollRates.NITA.employer },
          helb,
          nhif,
          custom: employeeData.customDeductions,
        },
        netPay,
        dateGenerated: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
        paymentMethod: employeeData.paymentDetails?.method,
        bankName: employeeData.paymentDetails?.bankName,
        accountNumber: employeeData.paymentDetails?.accountNumber,
        phone: employeeData.paymentDetails?.phone,
        clientId: employeeData.clientId || clientId, // Prioritize employee's client ID
      };
      payslipsBatch.set(payslipDocRef, payslipData);
      payslipDocsData.push(payslipData);
    }

    await payslipsBatch.commit();

    // Audit Log (Simplified)
    const auditLogRef = adminDb.collection('payrollAudits').doc(`${period.replace(/\s+/g, '_')}_${clientId || 'GeneralOrg'}_${Date.now()}`);
    const auditLogData: Partial<PayrollAudit> = {
      period,
      status: 'Open', // Payroll Run might not mean closed. Closure is a separate step.
      totalNetPay: totalNetPayForAudit,
      totalDeductions: totalDeductionsForAudit,
      payslipIds: payslipDocsData.map(p => p.id),
      clientId: clientId,
      // executedBy: context.auth.uid, // if using callable, or from verified ID token
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await auditLogRef.set(auditLogData);

    // TODO: Trigger notifications (e.g., via Pub/Sub to another function for emailing/FCM)

    res.status(200).json({
      success: true,
      message: `Payroll processed successfully for ${period}. ${payslipDocsData.length} payslips generated.`,
      payslipsGenerated: payslipDocsData.length,
      totalNetPay: totalNetPayForAudit,
      totalDeductions: totalDeductionsForAudit,
    });

  } catch (error: any) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ error: 'Internal server error during payroll processing.', details: error.message });
  }
});
