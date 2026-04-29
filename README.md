cd C:\Work\GitHub\MedMatrix\backend
npm install express mongoose jsonwebtoken dotenv cors helmet express-rate-limit bcrypt
npm install -D nodemon jest supertest
npm install crypto-js
npm install firebase-admin

cd C:\Work\GitHub\MedMatrix\frontend
npm install axios react-router-dom chart.js react-chartjs-2 jwt-decode
npm install -D tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom
npm install chart.js
npm install framer-motion
npm install lucide-react    
npm install recharts
npm install firebase

## Folder Structure
Aegis/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── patient.controller.js
│   │   └── healthLog.controller.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Patient.model.js
│   │   ├── HealthLog.model.js
│   │   ├── Hospital.model.js
│   │   └── Specialization.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── patient.routes.js
│   │   └── healthLog.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── features/
        │   │   ├── Landing/
        │   │   ├── Auth/
        │   │   ├── Doctor/
        │   │   ├── Patient/
        │   │   └── Admin/
        │   │       ├── AdminDashboard.jsx
        │   │       └── components/
        │   │           ├── AdminSidebar/
        │   │           ├── AdminHeader/
        │   │           ├── AdminStats/
        │   │           ├── OverviewTab/
        │   │           ├── HospitalsTab/
        │   │           ├── DoctorsTab/
        │   │           ├── PatientsTab/
        │   │           ├── SpecializationsTab/
        │   │           └── modals/
        │   └── common/
        │       └── Button, Input, Card
        ├── styles/
        │   ├── global.css
        │   └── variables.css
        └── App.js