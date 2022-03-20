export interface Description {
  main: string;
  responsibilities?: string[];
}

export interface EmployeeDetail {
  title: string;
  institution?: string;
  location?: string;
  timePeriod?: string;
  description?: Description;
}

export interface Employee {
  name: string;
  title: string;
  email: string;
  location: string;
  aboutMe: string;
  jobs: EmployeeDetail[];
  skills: EmployeeDetail[];
  education: EmployeeDetail[];
  certifications: EmployeeDetail[];
  pdfUrl?: string;
}
