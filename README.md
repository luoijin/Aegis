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
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── Card/
│   │   │   ├── Card.jsx
│   │   │   └── Card.css
│   │   └── Input/
│   │       ├── Input.jsx
│   │       └── Input.css
│   ├── layout/
│   │   ├── Header/
│   │   │   └── Header.jsx
│   │   ├── Sidebar/
│   │   │   └── Sidebar.jsx
│   │   └── Layout/
│   │       └── Layout.jsx
│   └── features/
│       ├── Auth/
│       │   └── Login.jsx
│       ├── Dashboard/
│       │   └── Dashboard.jsx
│       └── Patients/
│           └── PatientList.jsx
├── pages/
│   ├── LoginPage.jsx
│   └── DashboardPage.jsx
├── contexts/
│   └── AuthContext.jsx
├── utils/
│   └── api.js
├── styles/
│   ├── global.css
│   └── variables.css
├── App.js
└── index.js