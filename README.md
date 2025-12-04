# Om Jagdamb Tools and Services - E-Commerce Platform

A modern, full-stack e-commerce platform for construction tools and services, featuring a responsive frontend and Django REST API backend.

## 🚀 Features

### Frontend Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Product Catalog**: Dynamic product display with search and filtering
- **Shopping Cart**: Real-time cart updates with backend synchronization
- **User Authentication**: Login/Register with session management
- **Wishlist**: Save favorite products for later
- **Order Management**: Complete checkout flow with order tracking
- **User Dashboard**: View orders, manage profile, and settings
- **Payment Integration**: Multiple payment methods (COD, UPI, Card)

### Backend Features (Django)
- **REST API**: Django REST Framework for all operations
- **Product Management**: CRUD operations with image handling
- **Cart System**: Persistent cart with user authentication
- **Order Processing**: Complete order lifecycle management
- **User Accounts**: Custom user model with profiles
- **Admin Panel**: Django admin for content management

## 📁 Project Structure

```
om-jagdamb-tools/
├── Frontend/
│   ├── index.html              # Homepage
│   ├── product_webpage.html    # Product listing
│   ├── product_detail.html     # Product details
│   ├── cart.html               # Shopping cart
│   ├── payment.html            # Checkout page
│   ├── wishlist.html           # Wishlist page
│   ├── dashboard.html          # User dashboard
│   ├── profile.html            # User profile
│   ├── login.html              # Login page
│   ├── signup.html             # Registration page
│   ├── about.html              # About us
│   ├── contact.html            # Contact page
│   ├── styles.css              # Main stylesheet
│   ├── script.js               # Main JavaScript
│   ├── cart-api.js             # Cart API client
│   ├── cart-ui.js              # Cart UI components
│   ├── auth-helper.js          # Authentication helpers
│   └── payment.js              # Payment processing
│
└── ecommerce_backend/
    ├── products/               # Product management
    ├── cart/                   # Cart operations
    ├── orders/                 # Order processing
    ├── payments/               # Payment handling
    ├── accounts/               # User authentication
    └── manage.py               # Django management
```

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Tailwind CSS
- **JavaScript ES6+** - Vanilla JS for interactivity
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **Python 3.x** - Programming language
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **SQLite/PostgreSQL** - Database
- **Pillow** - Image processing

## 🚀 Getting Started

### Frontend Setup

1. **Open the project**
   ```bash
   cd om-jagdamb-tools
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
   ```bash
   python -m http.server 8080
   ```

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd ecommerce_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start server**
   ```bash
   python manage.py runserver
   ```

7. **Access admin panel**
   - URL: http://127.0.0.1:8000/admin/
   - Add products, manage orders

## 📱 Key Pages

### Public Pages
- **Homepage** - Hero section, featured products, services
- **Products** - Product catalog with search and filters
- **Product Detail** - Detailed view with quantity selector
- **About** - Company information and team
- **Contact** - Contact form and information

### User Pages (Login Required)
- **Cart** - Shopping cart with quantity management
- **Checkout** - Payment and shipping information
- **Dashboard** - Order history and statistics
- **Profile** - User information and settings
- **Wishlist** - Saved products

### Admin Pages
- **Admin Dashboard** - Content management
- **Product Management** - Add/edit products
- **Order Management** - Process orders
- **User Management** - Manage customers

## 💡 Core Features

### Shopping Cart
- Add products with custom quantities
- Update quantities in real-time
- Remove items with confirmation
- Persistent cart (localStorage + backend)
- Cross-tab synchronization
- Order summary with shipping calculation

### User Authentication
- Register new account
- Login with email/password
- Admin login (separate flow)
- Session management
- Protected routes

### Product Management
- Dynamic product loading from API
- Image gallery support
- Stock management
- Category filtering
- Search functionality

### Order Processing
- Complete checkout flow
- Multiple payment methods
- Order confirmation
- Email notifications (ready)
- Order tracking

## 🔧 Configuration

### API Endpoints

Base URL: `http://127.0.0.1:8000/api/`

- **Products**: `/products/`
- **Cart**: `/cart/`
- **Orders**: `/orders/`
- **Auth**: `/auth/`

### Environment Variables

Create `.env` file in `ecommerce_backend/`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

## 🧪 Testing

### Test Cart Functionality

Open browser console and run:

```javascript
// Add test product
localStorage.setItem('cart', JSON.stringify([{
    id: 1,
    name: 'Test Product',
    price: 99.99,
    quantity: 2,
    slug: 'test',
    image: '',
    description: 'Test'
}]));

// Go to cart.html to see it
```

### Test Backend API

```bash
# Test products endpoint
curl http://127.0.0.1:8000/api/products/

# Test cart endpoint (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/cart/
```

## 📈 Features Implemented

✅ Responsive design across all devices
✅ Product catalog with Django backend
✅ Shopping cart with backend sync
✅ User authentication system
✅ Order management system
✅ Payment integration (COD, UPI, Card)
✅ Wishlist functionality
✅ User dashboard and profile
✅ Admin panel for management
✅ Real-time cart updates
✅ Stock management
✅ Order confirmation page

## 🔒 Security

- CSRF protection enabled
- XSS prevention
- SQL injection protection (Django ORM)
- Password hashing (Django auth)
- Secure session management
- Input validation on frontend and backend

## 📞 Support

For questions or support:
- Email: info@omjagdambtools.com
- Phone: +91 [phone_number]

## 📄 License

This project is created for Om Jagdamb Tools and Services. All rights reserved.

---