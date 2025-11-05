from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product
from accounts.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for Om Jagdamb Tools'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create superuser
        if not User.objects.filter(email='admin@omjagdambtools.com').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@omjagdambtools.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f'Created admin user: {admin_user.email}')
        
        # Create categories
        categories_data = [
            {'name': 'Hand Tools', 'description': 'Manual construction tools'},
            {'name': 'Power Tools', 'description': 'Electric and battery-powered tools'},
            {'name': 'Safety Equipment', 'description': 'Safety gear and protective equipment'},
            {'name': 'Hardware', 'description': 'Nuts, bolts, screws and fasteners'},
            {'name': 'Measuring Tools', 'description': 'Measuring and marking tools'},
        ]
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Create products
        products_data = [
            {
                'name': 'Professional Hammer',
                'description': 'Heavy-duty steel hammer designed for professional construction work. Features an ergonomic handle for comfortable grip and balanced weight distribution for optimal performance.',
                'short_description': 'Heavy-duty steel hammer for construction work',
                'category': 'Hand Tools',
                'sku': 'HAM-001',
                'price': 899.00,
                'original_price': 999.00,
                'stock_quantity': 25,
                'brand': 'Om Jagdamb',
                'is_featured': True,
            },
            {
                'name': 'Electric Drill',
                'description': 'High-power electric drill with variable speed control and multiple drill bits included. Perfect for both professional and DIY projects.',
                'short_description': 'High-power electric drill with multiple bits',
                'category': 'Power Tools',
                'sku': 'DRL-001',
                'price': 2499.00,
                'original_price': 2799.00,
                'stock_quantity': 15,
                'brand': 'Om Jagdamb',
                'is_featured': True,
            },
            {
                'name': 'Safety Helmet',
                'description': 'ANSI certified safety helmet with adjustable suspension system. Provides maximum protection for construction workers.',
                'short_description': 'ANSI certified safety helmet',
                'category': 'Safety Equipment',
                'sku': 'SAF-001',
                'price': 599.00,
                'original_price': 699.00,
                'stock_quantity': 30,
                'brand': 'Om Jagdamb',
                'is_featured': False,
            },
            {
                'name': 'Measuring Tape 5m',
                'description': 'Professional grade measuring tape with clear markings and durable construction. Perfect for accurate measurements.',
                'short_description': 'Professional 5m measuring tape',
                'category': 'Measuring Tools',
                'sku': 'MEA-001',
                'price': 299.00,
                'stock_quantity': 50,
                'brand': 'Om Jagdamb',
                'is_featured': False,
            },
            {
                'name': 'Screwdriver Set',
                'description': 'Complete set of screwdrivers with various sizes and types. Includes both flathead and Phillips head screwdrivers.',
                'short_description': 'Complete screwdriver set',
                'category': 'Hand Tools',
                'sku': 'SCR-001',
                'price': 799.00,
                'stock_quantity': 20,
                'brand': 'Om Jagdamb',
                'is_featured': True,
            },
            {
                'name': 'Angle Grinder',
                'description': 'Powerful angle grinder for cutting and grinding applications. Variable speed control and safety features included.',
                'short_description': 'Powerful angle grinder',
                'category': 'Power Tools',
                'sku': 'GRN-001',
                'price': 3499.00,
                'original_price': 3999.00,
                'stock_quantity': 10,
                'brand': 'Om Jagdamb',
                'is_featured': True,
            },
        ]
        
        for prod_data in products_data:
            category = Category.objects.get(name=prod_data['category'])
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                defaults={
                    'name': prod_data['name'],
                    'description': prod_data['description'],
                    'short_description': prod_data['short_description'],
                    'category': category,
                    'price': prod_data['price'],
                    'original_price': prod_data.get('original_price'),
                    'stock_quantity': prod_data['stock_quantity'],
                    'brand': prod_data['brand'],
                    'is_featured': prod_data['is_featured'],
                }
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('Admin credentials:')
        self.stdout.write('Email: admin@omjagdambtools.com')
        self.stdout.write('Password: admin123')
