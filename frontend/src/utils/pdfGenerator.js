import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePrescriptionPDF = async (prescription) => {
  const patientName = `${prescription.patient?.user?.profile?.firstName || ''} ${prescription.patient?.user?.profile?.lastName || ''}`.trim();
  
  // Get doctor information from prescription (already populated from backend)
  const doctorFirstName = prescription.doctor?.profile?.firstName || '';
  const doctorLastName = prescription.doctor?.profile?.lastName || '';
  const doctorName = `Dr. ${doctorFirstName} ${doctorLastName}`.trim();
  const doctorLicense = prescription.doctor?.licenseNumber || 'Not specified';
  const doctorSpecialization = prescription.doctor?.specialization || 'General Medicine';
  const hospitalName = prescription.doctor?.hospital?.name || 'AEGIS Health System';
  
  const date = new Date(prescription.issuedDate).toLocaleDateString();
  const prescriptionId = prescription._id?.slice(-8) || 'N/A';
  
  // Create a hidden div with the prescription content
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '-9999px';
  element.style.width = '800px';
  element.style.backgroundColor = 'white';
  element.style.padding = '40px';
  element.style.fontFamily = "'Segoe UI', Arial, sans-serif";
  element.style.borderRadius = '16px';
  
  element.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: #0A0F1D; color: white; padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">${hospitalName}</h1>
        <p style="font-size: 13px; opacity: 0.8;">Digital Prescription System</p>
        <p style="font-size: 11px; opacity: 0.6; margin-top: 8px;">Prescription ID: ${prescriptionId}</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px;">
        <!-- Patient & Doctor Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E2E8F0;">
          <div>
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Patient Information</div>
            <div style="font-size: 16px; font-weight: 600; color: #0A0F1D;">${patientName || 'Unknown Patient'}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Date of Issue: ${date}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Prescribing Doctor</div>
            <div style="font-size: 16px; font-weight: 600; color: #0A0F1D;">${doctorName || 'Unknown Doctor'}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">License: ${doctorLicense}</div>
            <div style="font-size: 12px; color: #64748B;">Specialization: ${doctorSpecialization}</div>
          </div>
        </div>
        
        <!-- Medications -->
        <div style="margin-bottom: 28px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0A0F1D; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #3B82F6; display: inline-block;">Medications</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 12px; background: #F8FAFC; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #E2E8F0;">Medication</th>
                <th style="text-align: left; padding: 12px; background: #F8FAFC; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #E2E8F0;">Dosage</th>
                <th style="text-align: left; padding: 12px; background: #F8FAFC; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #E2E8F0;">Frequency</th>
                <th style="text-align: left; padding: 12px; background: #F8FAFC; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #E2E8F0;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications?.map(med => `
                <tr>
                  <td style="padding: 12px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${med.name || '-'}</td>
                  <td style="padding: 12px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${med.dosage || '-'}</td>
                  <td style="padding: 12px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${med.frequency || '-'}</td>
                  <td style="padding: 12px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${med.duration || '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="padding: 12px; text-align: center;">No medications listed</td></tr>'}
            </tbody>
          </table>
        </div>
        
        ${prescription.notes ? `
        <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h4 style="font-size: 13px; font-weight: 600; color: #0A0F1D; margin-bottom: 8px;">Additional Notes</h4>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">${prescription.notes}</p>
        </div>
        ` : ''}
        
        <div style="background: #EFF6FF; padding: 16px 20px; border-radius: 12px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 500; color: #0A0F1D;">Refills Remaining</span>
          <span style="font-size: 16px; font-weight: 700; color: #3B82F6;">${prescription.refillsRemaining || 0}</span>
        </div>
        
        <!-- Digital Signature -->
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #CBD5E1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <p style="font-size: 10px; color: #94A3B8;">Electronically Prescribed by:</p>
              <p style="font-size: 12px; font-weight: 500; color: #0A0F1D;">${doctorName}</p>
              <p style="font-size: 10px; color: #64748B;">License: ${doctorLicense}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #94A3B8;">Valid Without Signature</p>
              <p style="font-size: 10px; color: #94A3B8;">${date}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; border-radius: 0 0 16px 16px;">
        <p style="font-size: 10px; color: #94A3B8;">This is a computer-generated prescription. No physical signature required.</p>
        <p style="font-size: 10px; color: #94A3B8; margin-top: 4px;">${hospitalName} - Secure Digital Healthcare System</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(element);
  
  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save PDF
    pdf.save(`prescription_${patientName.replace(/\s/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    // Clean up
    document.body.removeChild(element);
  }
};