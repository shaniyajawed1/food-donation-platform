# Food Donation Platform

## Project Overview

This is a comprehensive web platform designed to connect food donors with recipients in need. The application facilitates the efficient distribution of surplus food from restaurants, businesses, and individuals to food banks, shelters, and community organizations. By leveraging modern web technologies, food-donation-platform aims to reduce food waste while addressing food insecurity in local communities.

## Key Features

### For Food Donors
- **Easy Food Listing**: Simple form-based interface to list surplus food items with detailed descriptions
- **Image Upload Support**: Capability to upload up to 5 images per listing with drag-and-drop functionality
- **Smart Categorization**: Organized food type classification and quantity specifications
- **Pickup Coordination**: Integrated scheduling system for seamless donation pickups
- **Impact Tracking**: Real-time statistics showing the number of meals donated and community impact

### For Food Recipients
- **Real-time Listings**: Access to current available food donations in their area
- **Location-based Search**: Find nearby food donations using geographic filtering
- **Direct Communication**: Built-in messaging system to coordinate with donors
- **Availability Updates**: Live status updates on food availability
- **Safe Verification**: Verified donor system ensuring food safety standards

### Platform Capabilities
- **Multi-step Donation Process**: Guided form with progress indicators for easy food listing
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices
- **User Authentication**: Secure login and registration system
- **Donation Management**: Complete CRUD operations for donation listings
- **Real-time Notifications**: Alert system for new donations and pickup confirmations

## Technology Stack

### Frontend
- **React 18**: Modern functional components with hooks
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing for single-page application
- **Context API**: State management for user authentication and global state

### Backend
- **Node.js**: Runtime environment for server-side operations
- **Express.js**: Web application framework for API routes
- **MongoDB**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure token-based user authentication

### Additional Libraries
- **File Processing**: Image upload and validation utilities
- **Date Handling**: Comprehensive date manipulation and formatting
- **Form Validation**: Client and server-side input validation
- **API Integration**: RESTful API communication services

## Project Structure

```
food-donation-platform/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── navigation/
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── DonationHistory.jsx
│   │   ├── FoodListingForm.jsx
│   │   ├── DonorDashboard.jsx
│   │   └── RecipientDashboard.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── helpers.js
│   └── styles/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── config/
```

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB (version 4.4 or higher)
- npm or yarn package manager

### Frontend Setup
1. Navigate to the project directory:
   ```bash
   cd food-donation-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```
   Update the environment variables in the `.env` file with your specific configuration.

4. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Set your MongoDB connection string, JWT secret, and other configuration values.

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The API server will run on `http://localhost:5000`

## Usage Guide

### For Donors
1. **Registration**: Create a donor account with basic information
2. **Listing Creation**: Use the multi-step form to list available food items
3. **Image Upload**: Add photos of the food items for transparency
4. **Pickup Coordination**: Specify pickup location and available times
5. **Donation Management**: Track and manage active donations through the dashboard

### For Recipients
1. **Account Setup**: Register as a food bank or community organization
2. **Browse Listings**: View available food donations in your area
3. **Request Donations**: Contact donors to arrange pickup
4. **Track History**: Maintain records of received donations

### Platform Administration
1. **User Management**: Monitor and verify donor and recipient accounts
2. **Content Moderation**: Review and approve food listings
3. **Analytics Dashboard**: Track platform usage and impact metrics

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Donation Endpoints
- `GET /api/donations` - Retrieve all available donations
- `POST /api/donations` - Create new donation listing
- `GET /api/donations/:id` - Get specific donation details
- `PUT /api/donations/:id` - Update donation information
- `DELETE /api/donations/:id` - Remove donation listing
- `GET /api/donations/user/:userId` - Get user's donation history

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user information
- `GET /api/users/donations` - Get user's donation statistics

## Configuration

### Environment Variables
Frontend Environment Variables:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_UPLOAD_MAX_SIZE=5242880
REACT_APP_MAX_IMAGES=5
```

Backend Environment Variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-donation-platform
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_URL=your_cloudinary_url
```

## Contributing

We welcome contributions to improve. Please follow these guidelines:

1. Fork the repository and create a feature branch
2. Follow the existing code style and conventions
3. Write comprehensive tests for new functionality
4. Update documentation as needed
5. Submit a pull request with a clear description of changes

### Development Workflow
1. Set up the development environment as described above
2. Create a new branch for your feature or bugfix
3. Make your changes with appropriate testing
4. Ensure all tests pass before submitting
5. Update relevant documentation

## Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### End-to-End Testing
We recommend using Cypress for end-to-end testing of critical user flows.

## Deployment

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Deployment Options
- **Frontend**: Deploy the build folder to platforms like Netlify, Vercel, or AWS S3
- **Backend**: Deploy to platforms like Heroku, DigitalOcean, or AWS EC2
- **Database**: Use MongoDB Atlas for cloud database hosting

### Production Considerations
- Configure environment variables for production
- Set up proper SSL certificates
- Implement monitoring and logging
- Configure backup strategies
- Set up CDN for static assets

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- CORS configuration
- File upload restrictions
- SQL injection prevention
- XSS protection measures

## Performance Optimizations

- Image compression and optimization
- Lazy loading for images
- Code splitting for React components
- Database indexing for frequent queries
- Caching strategies for static content
- CDN integration for global delivery

## Browser Support

food-donation-platform supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Support

For technical support or questions about using food-donation-platform:
- Check our documentation
- Open an issue on GitHub
- Contact our support team at support@food-donation-platform.org

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Built with the React community and ecosystem
- Inspired by organizations fighting food waste and hunger
- Thanks to all contributors and testers who helped shape this platform
