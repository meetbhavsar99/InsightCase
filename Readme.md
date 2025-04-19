# InsightCase

InsightCase is a comprehensive **Case Management Tool** designed to streamline employment services for individuals with disabilities. This tool was developed for a business to optimize their workflow and service delivery. The project was selected at the **11th CS Demo Day** at the University of Windsor among the top teams and won the project pitch competition among two other teams during the **Internship Project - I** course at the University of Windsor.

## Features

- **User Authentication:** Microsoft login feature with JWT-based authentication and role-based access control.
- **Task Management:** Integration with Microsoft To-Do for task assignment and tracking.
- **Event Scheduling:** Calendar event management via Microsoft Calendar.
- **Email Integration:** Communication support through Outlook integration.
- **Workflow Automation:** Simplified and efficient workflows for case management.
- **Database Management:** Centralized data storage with PostgreSQL.

## Technologies Used

### Frontend

- **Next.js**
- **React.js**
- **Tailwind CSS**

### Backend

- **NestJS** (Node.js Framework)
- **PostgreSQL** (Database)
- **Microsoft Graph API** (Integration with Microsoft 365 apps)

## Folder Structure

```
InsightCase/
├── Frontend   # Contains the Next.js frontend app
└── Backend    # Contains the Nest.js backend app
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- Microsoft Developer Account for API keys

### Steps to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Vrutik21/InsightCase.git
   cd InsightCase
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd Frontend
   npm install
   cd ../Backend
   npm install
   ```

3. Set up environment variables:

   - For **Frontend**, create a `.env` file in the `Frontend` folder.
   - For **Backend**, create a `.env` file in the `Backend` folder.

4. Start the development servers:

   ```bash
   # Start frontend
   cd Frontend
   npm run dev

   # Start backend
   cd ../Backend
   npm run start:dev
   ```

5. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries, feel free to reach out:

- **Email:** parmar8a@uwindsor.ca
- **LinkedIn:** [Vrutik Parmar](https://www.linkedin.com/in/vrutik-parmar-9261821b8/)
